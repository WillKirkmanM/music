use actix_web::http::header;
use actix_web::{ HttpResponse, get, Responder, web };
use reqwest::StatusCode;
use tokio::fs;
use std::time::Instant;
use std::sync::{ Arc, Mutex };
use std::fs::File;
use std::io::{Read, SeekFrom, Seek};

use walkdir::WalkDir;
use audiotags::Tag;
use tracing::{info, warn};
use rayon::prelude::*;
use tokio::time::{sleep, Duration};

use crate::structures::structures::{Album, Artist, Song};
use crate::utils::format::format_contributing_artists;

#[get("/songs/list")]
async fn songs_list() -> impl Responder {

    let now = Instant::now();

    let mut i = 0;
    for entry in WalkDir::new("C:\\Users\\willi\\Documents\\Lawliet\\Music") {
        let entry = entry.unwrap();
        let extension = entry.path().extension().unwrap_or_default();

        if entry.file_type().is_file() && extension == "mp3" || extension == "flac" {
            i+=1;
            // println!("{}", entry.path().display());
        }
    }

    let message = format!("{} songs found in {}ms", i, now.elapsed().as_millis());

    HttpResponse::Ok().body(message)
}

#[get("/library/index/{path}")]
async fn index_library(path: web::Path<String>) -> impl Responder {
    info!("Indexing library...");

    let now = Instant::now();

    let library = Arc::new(Mutex::new(Vec::<Artist>::new()));

    let files: Vec<_> = WalkDir::new(&*path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.file_type().is_file() &&
            matches!(e.path().extension().and_then(|s| s.to_str()), Some("mp3") | Some("flac") | Some("ogg") | Some("m4a"))
        })
        .collect();

    files.par_iter().for_each(|entry| {
        let path = entry.path();
        let tag = Tag::new().read_from_path(&path).unwrap();

        let artists = tag.artists().unwrap_or_default().iter().map(|&s| s.to_string()).collect::<Vec<String>>();
        let formatted_artists = format_contributing_artists(artists);

        let artist_name = formatted_artists[0].0.clone();
        let contributing_artists = formatted_artists[0].1.clone();

        let album_name = tag.album_title().unwrap_or_default().to_string();
        let song = Song {
            name: tag.title().unwrap_or_default().to_string(),
            artist: artist_name.clone(),
            contributing_artists,
            track_number: tag.track_number().unwrap_or_default(),
            path: path.to_str().unwrap_or_default().to_string(),
        };
    
    
        let mut library = library.lock().unwrap();

        let artist_name_lowercase = artist_name.to_lowercase();
        let artist_position = library.iter().position(|a| a.name.to_lowercase() == artist_name_lowercase);

        let artist = if let Some(artist_position) = artist_position {
            &mut library[artist_position]
        } else {
            let new_artist = Artist { name: artist_name.clone(), albums: Vec::new() };
            library.push(new_artist);
            library.last_mut().unwrap()
        };

        let album_position = artist.albums.iter().position(|a| a.name == album_name);

        let album = if let Some(album_position) = album_position {
            &mut artist.albums[album_position]
        } else {
            let new_album = Album { name: album_name.clone(), songs: Vec::new(), cover_url: String::new() };
            artist.albums.push(new_album);
            artist.albums.sort_by(|a, b| a.name.cmp(&b.name));
            artist.albums.last_mut().unwrap()
        };
        
        album.songs.push(song);
        album.songs.sort_by(|a, b| a.track_number.cmp(&b.track_number));
    });

    let mut library = library.lock().unwrap();
    library.sort_by(|a, b| a.name.cmp(&b.name));
    let elapsed = now.elapsed().as_millis();

    let client = reqwest::Client::builder()
            .user_agent("ParsonLabsMusic/0.1 (will@parsonlabs.com)")
            .build()
            .unwrap();

    // Adding metadata from musicbrainz
    let total_album_count: usize = library.iter().map(|artist| artist.albums.len()).sum();
    info!("Searching cover art for {} albums...", total_album_count);

    for artist in library.iter_mut() {
        for album in &mut artist.albums {
            let url = format!("https://musicbrainz.org/ws/2/release/?query=artist:\"{}\" AND release:\"{}\" AND status:\"Official\"&fmt=json", artist.name, album.name);
            let response = client.get(&url).send().await;
    
            match response {
                Ok(response) => {
                    let body = response.text().await.unwrap();
                    let v: serde_json::Value = serde_json::from_str(&body).unwrap_or("[]".into());
    
                    if let Some(albums) = v["releases"].as_array() {
                        for first_album in albums {
                            let album_id = first_album["id"].as_str().unwrap();
    
                            let cover_art_url = format!("http://coverartarchive.org/release/{}", album_id);
                            let cover_art_response = client.get(&cover_art_url).send().await;
    
                            match cover_art_response {
                                Ok(cover_art_response) => {
                                    if cover_art_response.status().is_success() {
                                        let cover_art_body = cover_art_response.text().await.unwrap();
                                        let cover_art: serde_json::Value = serde_json::from_str(&cover_art_body).unwrap();
    
                                        if let Some(images) = cover_art["images"].as_array() {
                                            if let Some(first_image) = images.get(0) {
                                                if let Some(image_url) = first_image["image"].as_str() {
                                                    album.cover_url = image_url.to_string();
                                                    info!("Cover art found for Album: {}", album.name);
                                                    break;
                                                }
                                            }
                                        }
                                    } else {
                                        warn!("Cover art for album {} could not be found initially, alternative art will be searched.", album.name);
                                    }
                                },
                                Err(e) => {
                                    if e.status() == Some(StatusCode::SERVICE_UNAVAILABLE) {
                                        warn!("Service unavailable (503) when trying to fetch cover art for album: {}", album.name);
                                    } else {
                                        warn!("Error when trying to fetch cover art for album: {}. Error: {}", album.name, e);
                                    }
                                }
                            }
                        }
                    }
                },
                Err(e) => {
                    if e.status() == Some(StatusCode::SERVICE_UNAVAILABLE) {
                        warn!("Service unavailable (503) when trying to fetch data for artist: {} and album: {}", artist.name, album.name);
                    } else {
                        warn!("Error when trying to fetch data for artist: {} and album: {}. Error: {}", artist.name, album.name, e);
                    }
                }
            }
            sleep(Duration::from_secs(1)).await
        }
    }
    
            // Parse the response body to JSON
            // let v: Value = serde_json::from_str(&body).unwrap();
    
            // Get the id of the first album
            /*
            if let Some(first_album) = v["releases"].as_array().and_then(|a| a.get(0)) {
                let album_id = first_album["id"].as_str().unwrap();
            
                let tracklist_url = format!("https://musicbrainz.org/ws/2/release/{}/?inc=aliases+artist-credits+labels+discids+recordings&fmt=json", album_id);
                let tracklist_response = client.get(&tracklist_url).send().await.unwrap();
                let tracklist_body = tracklist_response.text().await.unwrap();
            
                // Parse the tracklist response to JSON
                let tracklist: Value = serde_json::from_str(&tracklist_body).unwrap();
            
                // Print the songs
                if let Some(media) = tracklist["media"].as_array() {
                    for medium in media {
                        if let Some(tracks) = medium["tracks"].as_array() {
                            for track in tracks {
                                let title = track["title"].as_str().unwrap();
                                let duration = track["length"].as_i64().unwrap_or(0) / 1000; // Convert from ms to s
                                let position = track["position"].as_i64().unwrap_or(0);
                                let artist = track["artist-credit"].as_array().and_then(|a| a.get(0)).and_then(|a| a["artist"]["name"].as_str()).unwrap_or("Unknown artist");
            
                                // Extract additional information
                                let disc_id = track["id"].as_str().unwrap_or("Unknown disc id");
                                let label_info = track["label-info"].as_array().and_then(|a| a.get(0)).and_then(|a| a["label"]["name"].as_str()).unwrap_or("Unknown label");
            
                                println!("Title: {}, Duration: {}s, Position: {}, Artist: {}, Disc ID: {}, Label: {}", title, duration, position, artist, disc_id, label_info);
                            }
                        }
                    }
                }
            }
            */
    
    info!("Finished Indexing Library in {}ms", elapsed);

    let json = serde_json::to_string(&*library).unwrap();
    HttpResponse::Ok().body(json)
}

#[get("/stream/{song}/{seconds}")]
async fn stream_song(path: web::Path<(String, u64)>) -> impl Responder {
    // let song = path.0.to_string();
    let seconds = path.1 + 3; // IT offsets by 3 seconds

    let song = "C:\\Users\\willi\\Documents\\Lawliet\\Music\\Kendrick Lamar - Discography (2009 - 2022) [FLAC] vtwin88cube\\2015 - To Pimp A Butterfly\\12.- Complexion (A Zulu Love).flac";

    let file = fs::metadata(song).await.unwrap();
    let song_file_size = file.len();

    let duration = Tag::new().read_from_path(song).unwrap().duration().unwrap().round() as u64;

    let bitrate = song_file_size * 8 / duration / 1000; // convert bytes to kilobits

    let start = 0;
    let end = (seconds * bitrate * 1000 / 8) as usize; // convert seconds to bytes

    let mut file = File::open(song).unwrap();
    file.seek(SeekFrom::Start(start as u64)).unwrap();
    let mut buffer = vec![0; end];
    file.read(&mut buffer).unwrap();

    HttpResponse::PartialContent()
        .append_header((header::CONTENT_TYPE, "audio/flac"))
        .append_header((header::CONTENT_RANGE, format!("bytes {}-{}/{}", start, end, file.metadata().unwrap().len())))
        .append_header((header::ACCEPT_RANGES, "bytes"))
        .append_header((header::CONTENT_LENGTH, (end - start + 1).to_string()))
        .body(buffer)
}

#[get("/format/{artist}")]
async fn format_contributing_artists_route(artist: web::Path<String>) -> impl Responder {
    let artists = vec![artist.to_string()];
    let formatted_artists = format_contributing_artists(artists);
    let json = serde_json::to_string(&formatted_artists).unwrap();
    HttpResponse::Ok().body(json)
}
