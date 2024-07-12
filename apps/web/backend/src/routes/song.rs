use actix_web::{get, web, HttpResponse};
use rand::seq::SliceRandom;

use crate::{structures::structures::{Album, Artist, Song}, utils::config::get_config};

#[get("/song/random/{amount}")]
async fn get_random_song(amount: web::Path<usize>) -> HttpResponse {
    let config = get_config().await.unwrap();

    let library: Vec<Artist> = match serde_json::from_str(&config) {
        Ok(library) => library,
        Err(_) => return HttpResponse::Ok().json(Vec::<Song>::new())
    };

    let mut random_songs = Vec::new();
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

        random_songs.push(random_song.clone());
    }

    HttpResponse::Ok().json(random_songs)
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

    for artist in library.iter() {
        for album in artist.albums.iter() {
            for song in album.songs.iter() {
                if song.id == song_id {
                  return HttpResponse::Ok().json(song);
                }
            }
        }
    }

    HttpResponse::NotFound().finish()
}