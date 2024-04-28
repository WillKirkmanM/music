use actix_web::http::header;
use actix_web::{ HttpResponse, get, Responder, web };
use lofty::{AudioFile, Probe};
use regex::Regex;
use reqwest::StatusCode;
use tokio::fs;
use std::ffi::OsStr;
use std::path::Path;
use std::time::Instant;
use std::sync::{ Arc, Mutex };
use std::fs::File;
use std::io::Read;

use walkdir::WalkDir;
use audiotags::Tag;
use tracing::{info, warn};
use rayon::prelude::*;
use tokio::time::{sleep, Duration};

use crate::structures::structures::{Album, Artist, Song};
use crate::utils::{ format::format_contributing_artists, hash::{hash_album, hash_song} };

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

        let song_name = tag.title().unwrap_or_default().to_string();
        let artist_name = formatted_artists[0].0.clone();
        let contributing_artists = formatted_artists[0].1.clone();

        let album_name = tag.album_title().unwrap_or_default().to_string();
        let re = Regex::new(r"\(.*\)").unwrap();
        let album_name_without_cd = re.replace_all(&album_name, "").trim().to_string();
        let track_number = tag.track_number().unwrap_or_default();

        let id = hash_song(&song_name, &artist_name, &album_name, track_number);

        let song = Song {
            name: song_name,
            id,
            artist: artist_name.clone(),
            contributing_artists,
            track_number,
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

        let album_position = artist.albums.iter().position(|a| a.name == album_name_without_cd);

        let album = if let Some(album_position) = album_position {
            &mut artist.albums[album_position]
        } else {
            let mut new_album = Album { id: hash_album(&album_name_without_cd.clone(), &artist_name), name: album_name_without_cd.clone(), songs: Vec::new(), cover_url: String::new() };

            if let Some(parent_path) = path.parent() {
                let mut cover_found = false;

                for image_path in WalkDir::new(parent_path)
                    .max_depth(1)
                    .into_iter()
                    .filter_map(|e| e.ok())
                    .filter(|e| {
                        e.file_type().is_file() &&
                        matches!(e.path().extension().and_then(|s| s.to_str()), Some("jpg") | Some("jpeg") | Some("png") | Some("gif") | Some("bmp") | Some("ico") | Some("tif") | Some("tiff") | Some("webp"))
                    }) {
                    new_album.cover_url = image_path.path().to_str().unwrap_or_default().to_string();
                    cover_found = true;
                    break;
                }
            
                // If no cover was found in the current directory, look in the parent directory

                if !cover_found && parent_path.read_dir().unwrap().any(|e| {
                if let Ok(entry) = e {
                    let path = entry.path();
                    let path_file_name = path.file_name().unwrap().to_str().unwrap();
                    path.is_dir() && (path_file_name.starts_with("CD") || path_file_name.starts_with("Disc")|| path.file_name().unwrap() == "Covers")
                } else {
                    false
                }}) {
                if let Some(grandparent_path) = parent_path.parent() {
                    for image_path in WalkDir::new(grandparent_path)
                        .max_depth(1)
                        .into_iter()
                        .filter_map(|e| e.ok())
                        .filter(|e| {
                            e.file_type().is_file() &&
                            matches!(e.path().extension().and_then(|s| s.to_str()), Some("jpg") | Some("jpeg") | Some("png") | Some("gif") | Some("bmp") | Some("ico") | Some("tif") | Some("tiff") | Some("webp"))
                        }) {
                        new_album.cover_url = image_path.path().to_str().unwrap_or_default().to_string();
                        break;
                    }
                }
            }}

            artist.albums.push(new_album);
            artist.albums.sort_by(|a, b| a.name.cmp(&b.name));
            artist.albums.last_mut().unwrap()
        };
        
        album.songs.push(song);
        album.songs.sort_by(|a, b| a.track_number.cmp(&b.track_number));
    });
    
    let mut library = library.lock().unwrap();
    library.iter_mut().for_each(|artist| {
        artist.albums.retain(|album| album.songs.len() > 2);
    });
    library.sort_by(|a, b| a.name.cmp(&b.name));

    let client = reqwest::Client::builder()
            .user_agent("ParsonLabsMusic/0.1 (will@parsonlabs.com)")
            .build()
            .unwrap();

    // Adding metadata from musicbrainz
    // let total_album_count: usize = library.iter().map(|artist| artist.albums.len()).sum();
    // info!("Searching cover art for {} albums...", total_album_count);
    let albums_without_cover_count = library.iter_mut().flat_map(|artist| artist.albums.iter_mut())
    .filter(|album| album.cover_url.is_empty())
    .collect::<Vec<_>>()
    .len();

    info!("Searching cover art for {} albums...", albums_without_cover_count);

    for artist in library.iter_mut() {
        for album in &mut artist.albums {
            if album.cover_url.is_empty() {
                let url = format!("https://musicbrainz.org/ws/2/release/?query=artist:\"{}\" AND release:\"{}\" AND (status:\"Official\" OR status:\"Promotion\")&fmt=json", artist.name, album.name);
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
                                                        info!("Cover art found online for Album: {}", album.name);

                                                        let image_response = client.get(image_url).send().await.unwrap();
                                                        let image_bytes = image_response.bytes().await.unwrap();

                                                        fs::create_dir_all("missing_cover_art").await.unwrap();
                                                        let cover_url_file_path = format!("missing_cover_art/{}.jpg", album.id);
                                                        fs::write(&cover_url_file_path, image_bytes).await.unwrap();

                                                        let absolute_path = fs::canonicalize(&cover_url_file_path).await.unwrap();
                                                        let absolute_path_str = absolute_path.to_str().unwrap().to_string();
                                                        let clean_path = absolute_path_str.trim_start_matches("\\\\?\\");
                                                        album.cover_url = clean_path.to_string();

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
    

    let elapsed = now.elapsed().as_secs();
    info!("Finished Indexing Library in {} seconds", elapsed);

    let json = serde_json::to_string(&*library).unwrap();
    HttpResponse::Ok().body(json)
}


#[get("/stream/{song}")]
async fn stream_song(path: web::Path<String>) -> impl Responder {
    let song = path.into_inner();

    let file = fs::metadata(&song).await.unwrap();
    let song_file_size = file.len();

    let path = Path::new(&song);

    if !path.is_file() {
        panic!("ERROR: Path is not a file!");
    }

    let tagged_file = Probe::open(path)
        .expect("ERROR: Bad path provided!")
        .read()
        .expect("ERROR: Failed to read file!");

    let mut file = File::open(&song).unwrap();
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).unwrap();

    let extension = path.extension().and_then(OsStr::to_str);
    let mime_type = match extension {
        Some("mp3") => "audio/mpeg",
        Some("flac") => "audio/flac",
        Some("wav") => "audio/wav",
        Some("ogg") => "audio/ogg",
        Some("aac") => "audio/aac",
        _ => "application/octet-stream",
    };

    HttpResponse::Ok()
        .append_header((header::CONTENT_TYPE, mime_type))
        .append_header((header::CONTENT_LENGTH, song_file_size.to_string()))
        .body(buffer)
}

#[get("/format/{artist}")]
async fn format_contributing_artists_route(artist: web::Path<String>) -> impl Responder {
    let artists = vec![artist.to_string()];
    let formatted_artists = format_contributing_artists(artists);
    let json = serde_json::to_string(&formatted_artists).unwrap();
    HttpResponse::Ok().body(json)
}
