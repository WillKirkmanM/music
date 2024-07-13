use actix_web::{get, web, HttpResponse};
use rand::seq::SliceRandom;
use serde::{Serialize, Deserialize};

use crate::{structures::structures::{Album, Artist, Song}, utils::config::get_config};

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
    let config = get_config().await.unwrap();

    let library: Vec<Artist> = match serde_json::from_str(&config) {
        Ok(library) => library,
        Err(_) => return HttpResponse::Ok().json(Vec::<ResponseSong>::new())
    };

    let mut response_songs = Vec::new();
    for _ in 0..*amount {
        let artists: Vec<&Artist> = library.iter().collect();
        let random_artist = match artists.choose(&mut rand::thread_rng()) {
            Some(artist) => artist,
            None => break,
        };

        let random_album = match random_artist.albums.choose(&mut rand::thread_rng()) {
            Some(album) => album,
            None => break,
        };

        let random_song = match random_album.songs.choose(&mut rand::thread_rng()) {
            Some(song) => song,
            None => break,
        };

        let response_song = ResponseSong {
            id: random_song.id.clone(),
            name: random_song.name.clone(),
            artist: random_song.artist.clone(),
            contributing_artists: random_song.contributing_artists.clone(),
            track_number: random_song.track_number,
            path: random_song.path.clone(),
            duration: random_song.duration,
            album_object: random_album.clone(),
            artist_object: random_artist.to_owned().clone(),
        };

        response_songs.push(response_song);
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

    HttpResponse::NotFound().finish()
}