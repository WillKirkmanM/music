use actix_web::http::header;
use actix_web::{ get, web, HttpRequest, HttpResponse, Responder };
use lofty::{AudioFile, Probe};
use regex::Regex;
use tokio::fs;
use std::ffi::OsStr;
use std::path::Path;
use std::time::Instant;
use std::sync::{ Arc, Mutex };
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};

use walkdir::WalkDir;
use audiotags::Tag;
use tracing::{info, warn};
use rayon::prelude::*;
use crate::structures::structures::{Album, Artist, Song};
use crate::utils::compare::compare;
use crate::utils::config::save_config;
use crate::utils::metadata::{process_album, process_albums, process_artist, process_artists, get_access_token};
use crate::utils::websocket::log_to_ws;
use crate::utils::{ format::format_contributing_artists, hash::{hash_artist, hash_album, hash_song} };
use crate::utils::library::index_library;

#[get("/songs/list")]
pub async fn songs_list() -> impl Responder {

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

#[get("/library/index/{pathToLibrary}")]
async fn process_library(path_to_library: web::Path<String>, ) -> impl Responder {
    info!("Indexing library...");
    log_to_ws("Indexing library...".to_string()).await.unwrap();

    let now = Instant::now();

    let library = index_library(path_to_library.as_str()).await.unwrap();

    let client = reqwest::Client::builder()
            .user_agent("ParsonLabsMusic/0.1 (will@parsonlabs.com)")
            .build()
            .unwrap();

        match compare(&library).await {
            Ok((mut new_artist_entries, new_album_entries, _new_song_entries)) => {
                if !new_artist_entries.is_empty() {
                    let artists_without_icon_count = new_artist_entries.iter()
                        .filter(|artist| artist.icon_url.is_empty())
                        .count();
                    let log = format!("Searching icon art for {} artists...", artists_without_icon_count);
                    info!(log);
                    log_to_ws(log).await.unwrap();
                    
                    match get_access_token().await {
                        Ok(access_token) => {
                            for artist in new_artist_entries.iter_mut() {
                                process_artist(&client, artist, access_token.clone()).await;
                            }
                        },
                        Err(e) => warn!("Failed to get access token. Error: {}", e),
                    }
                }
                
                if !new_album_entries.is_empty() {
                    let albums_without_cover_count = new_album_entries.iter()
                    .filter(|album| album.cover_url.is_empty())
                    .count();
                let log = format!("Searching cover art for {} albums...", albums_without_cover_count);
                info!(log);
                log_to_ws(log).await.unwrap();
                
                for artist in new_artist_entries.iter_mut() {
                    for album in artist.albums.iter_mut() {
                            process_album(&client, artist.name.clone(), album).await;
                        }
                    }
                }
            },
            Err(_e) => {
                let mut library_guard = library.lock().unwrap();
                process_artists(&client, &mut *library_guard).await;
                process_albums(&client, &mut *library_guard).await;
            },
        }
        
        //https://musicbrainz.org/ws/2/release/cbaf43b4-0d8f-4b58-9173-9fe7298e04e9?inc=aliases+artist-credits+labels+discids+recordings+release-groups+media+discids+recordings+artist-credits+isrcs+artist-rels+release-rels+url-rels+recording-rels+work-rels+label-rels+place-rels+event-rels+area-rels+instrument-rels+series-rels+work-rels&fmt=json
        
        
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
        
        
    let library_guard = library.lock().unwrap();
    let elapsed = now.elapsed().as_secs();

    let log = format!("Finished Indexing Library in {} seconds", elapsed);
    info!(log);
    log_to_ws(log).await.unwrap();

    let json = serde_json::to_string(&*library_guard).unwrap();

    save_config(&json).await.unwrap();
    HttpResponse::Ok()
        .content_type("application/json; charset=utf-8")
        .body(json)
}


#[get("/stream/{song}")]
async fn stream_song(req: HttpRequest, path: web::Path<String>) -> impl Responder {
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


    let range = req.headers().get("Range").and_then(|v| v.to_str().ok());
    let (start, end) = match range {
        Some(range) => {
            let bytes = range.trim_start_matches("bytes=");
            let range_parts: Vec<&str> = bytes.split('-').collect();
            let start = range_parts[0].parse::<u64>().unwrap_or(0);
            let end = range_parts.get(1).and_then(|s| s.parse::<u64>().ok()).unwrap_or(song_file_size - 1);
            (start, end)
        },
        None => (0, song_file_size - 1),
    };

    let mut file = File::open(&song).unwrap();
    let mut buffer = vec![0; (end - start + 1) as usize];
    file.seek(SeekFrom::Start(start)).unwrap();
    file.read_exact(&mut buffer).unwrap();

    let extension = path.extension().and_then(OsStr::to_str);
    let mime_type = match extension {
        Some("mp3") => "audio/mpeg",
        Some("flac") => "audio/flac",
        Some("wav") => "audio/wav",
        Some("ogg") => "audio/ogg",
        Some("aac") => "audio/aac",
        _ => "application/octet-stream",
    };

    let content_range = format!("bytes {}-{}/{}", start, end, song_file_size);
    let content_length = (end - start + 1).to_string();

    HttpResponse::PartialContent()
        .append_header((header::CONTENT_TYPE, mime_type))
        .append_header((header::CONTENT_RANGE, content_range))
        .append_header((header::CONTENT_LENGTH, content_length))
        .body(buffer)
}

#[get("/format/{artist}")]
async fn format_contributing_artists_route(artist: web::Path<String>) -> impl Responder {
    let artists = vec![artist.to_string()];
    let formatted_artists = format_contributing_artists(artists);
    let json = serde_json::to_string(&formatted_artists).unwrap();
    HttpResponse::Ok().body(json)
}

#[get("/library/index/without_cover_url/{path}")]
async fn index_library_no_cover_url(path: web::Path<String>) -> impl Responder {
    let files: Vec<_> = WalkDir::new(&*path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.file_type().is_file() &&
            matches!(e.path().extension().and_then(|s| s.to_str()), Some("mp3") | Some("flac") | Some("ogg") | Some("m4a"))
        })
        .collect();

    let library = Arc::new(Mutex::new(Vec::<Artist>::new()));

    files.par_iter().for_each(|entry| {
        let path = entry.path();
        let tag = match Tag::new().read_from_path(&path) {
            Ok(t) => t,
            Err(_) => return,
        };
        
        let artists = tag.artists().unwrap_or_default().iter().map(|&s| s.to_string()).collect::<Vec<String>>();
        let formatted_artists = format_contributing_artists(artists);
        
        let song_name = tag.title().unwrap_or_default().to_string();
        let artist_name = formatted_artists.get(0).map_or(String::new(), |a| a.0.clone());
        let contributing_artists = formatted_artists.get(0).map_or(Vec::new(), |a| a.1.clone());
        
        let album_name = tag.album_title().unwrap_or_default().to_string();
        let re = Regex::new(r"\(.*\)").unwrap();
        let album_name_without_cd = re.replace_all(&album_name, "").trim().to_string();
        let track_number = tag.track_number().unwrap_or_default();
        
        let id = hash_song(&song_name, &artist_name, &album_name, track_number);


        let tagged_file = Probe::open(path)
            .expect("ERROR: Bad path provided!")
            .read()
            .expect("ERROR: Failed to read file!");

        let duration = tagged_file.properties().duration().as_secs_f64();

        let song = Song {
            name: song_name,
            id,
            artist: artist_name.clone(),
            contributing_artists,
            track_number,
            path: path.to_str().unwrap().to_string(),
            duration 
        };
        
            let mut library = library.lock().unwrap();
    
            let artist_name_lowercase = artist_name.to_lowercase();
            let artist_position = library.iter().position(|a| a.name.to_lowercase() == artist_name_lowercase);
    
            let artist = if let Some(artist_position) = artist_position {
                &mut library[artist_position]
            } else {
                let new_artist = Artist { id: hash_artist(&artist_name), name: artist_name.clone(), albums: Vec::new(), icon_url: String::new(), followers: 0 };
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
                        new_album.cover_url = image_path.path().to_str().unwrap().to_string();
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

                            new_album.cover_url = image_path.path().to_str().unwrap().to_string();
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

    let json: String = serde_json::to_string(&*library.lock().unwrap()).unwrap();

    HttpResponse::Ok()
    .content_type("application/json; charset=utf-8")
    .body(json)

}

#[get("/test")]
async fn test() -> impl Responder {
    log_to_ws("Hit the test endpoint.".to_string()).await.unwrap();

    HttpResponse::Ok()
}