use actix_web::http::header;
use actix_web::{ get, web, HttpRequest, HttpResponse, Responder };
use tokio::fs;
use std::ffi::OsStr;
use std::path::Path;
use std::time::Instant;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};

use walkdir::WalkDir;
use tracing::{info, warn};
use crate::utils::compare::compare;
use crate::utils::config::save_config;
use crate::utils::metadata::{process_album, process_albums, process_artist, process_artists, get_access_token};
use crate::utils::websocket::log_to_ws;
use crate::utils::format::format_contributing_artists;
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

    // let tagged_file = Probe::open(path)
    //     .expect("ERROR: Bad path provided!")
    //     .read()
    //     .expect("ERROR: Failed to read file!");

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
    let indexed_library = index_library(path.as_str()).await.unwrap();

    let json: String = serde_json::to_string(&*indexed_library.lock().unwrap()).unwrap();

    HttpResponse::Ok()
    .content_type("application/json; charset=utf-8")
    .body(json)

}

#[get("/test")]
async fn test() -> impl Responder {
    log_to_ws("Hit the test endpoint.".to_string()).await.unwrap();

    HttpResponse::Ok()
}