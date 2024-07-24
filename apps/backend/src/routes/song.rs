use actix_web::{get, web, HttpResponse};
use rand::seq::{IteratorRandom, SliceRandom};
use serde::{Serialize, Deserialize};
use tracing::error;

use crate::{structures::structures::{Album, Artist}, utils::config::get_config};

#[derive(Serialize, Deserialize, Clone)]
pub struct ResponseSong {
    pub id: String,
    pub name: String,
    pub artist: String,
    pub contributing_artists: Vec<String>,
    pub track_number: u16,
    pub path: String,
    pub duration: f64,
    pub album_object: Album,
    pub artist_object: Artist,
}

#[get("/song/random/{amount}")]
async fn get_random_song(amount: web::Path<usize>) -> HttpResponse {
    let config = match get_config().await {
        Ok(config) => config,
        Err(_) => return HttpResponse::InternalServerError().json("Failed to load configuration"),
    };

    let library: Vec<Artist> = match serde_json::from_str(&config) {
        Ok(library) => library,
        Err(_) => return HttpResponse::Ok().json(Vec::<ResponseSong>::new()),
    };

    let mut response_songs = Vec::new();
    let mut rng = rand::thread_rng();

    for _ in 0..*amount {
        let mut valid_artist = None;
        let mut valid_album = None;
        let mut valid_song = None;

        for _ in 0..10 {
            if let Some(artist) = library.iter().choose(&mut rng) {
                if !artist.albums.is_empty() {
                    valid_artist = Some(artist);
                    break;
                }
            }
        }

        if let Some(artist) = valid_artist {
            for _ in 0..10 {
                if let Some(album) = artist.albums.choose(&mut rng) {
                    if !album.songs.is_empty() {
                        valid_album = Some(album);
                        break;
                    }
                }
            }
        }

        if let Some(album) = valid_album {
            if let Some(song) = album.songs.choose(&mut rng) {
                valid_song = Some(song);
            }
        }

        if let Some(song) = valid_song {
            let response_song = ResponseSong {
                id: song.id.clone(),
                name: song.name.clone(),
                artist: song.artist.clone(),
                contributing_artists: song.contributing_artists.clone(),
                track_number: song.track_number,
                path: song.path.clone(),
                duration: song.duration,
                album_object: valid_album.unwrap().clone(),
                artist_object: valid_artist.unwrap().to_owned().clone(),
            };

            response_songs.push(response_song);
        }
    }

    HttpResponse::Ok().json(response_songs)
}

#[get("/song/info/{id}")]
async fn get_song_info(id: web::Path<String>) -> HttpResponse {
    let config = match get_config().await {
        Ok(config) => config,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let library: Vec<Artist> = match serde_json::from_str(&config) {
        Ok(library) => library,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let song_id = id.into_inner();

    for artist in &library {
        for album in &artist.albums {
            for song in &album.songs {
                if song.id == song_id {
                    let response_song = ResponseSong {
                        id: song.id.clone(),
                        name: song.name.clone(),
                        artist: song.artist.clone(),
                        contributing_artists: song.contributing_artists.clone(),
                        track_number: song.track_number,
                        path: song.path.clone(),
                        duration: song.duration,
                        album_object: album.clone(),
                        artist_object: artist.clone(),
                    };
                    return HttpResponse::Ok().json(response_song);
                }
            }
        }
    }

    error!("Song with ID {} not found.", song_id);

    HttpResponse::NotFound().finish()
}