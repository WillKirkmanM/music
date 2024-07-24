use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use actix_web::{get, HttpResponse};
use serde::Serialize;
use uuid::Uuid;
use rayon::prelude::*;

use crate::structures::structures::{Artist, Album, Song};
use crate::utils::config::get_config;

#[derive(Serialize, Clone)]
struct CombinedItem {
    item_type: String,
    name: String,
    id: String,
    artist: Option<Artist>,
    album: Option<Album>,
    song: Option<Song>,
    acronym: Option<String>,
    generated_id: Uuid,
}

#[get("/search/populate")]
async fn populate_search() -> HttpResponse {
    let config = get_config().await.unwrap();
    let library: Vec<Artist> = serde_json::from_str(&config).unwrap();

    let generated_ids = Arc::new(Mutex::new(HashSet::new()));

    let unique_uuid = |generated_ids: &Arc<Mutex<HashSet<Uuid>>>| -> Uuid {
        let mut id;
        loop {
            id = Uuid::new_v4();
            let mut ids = generated_ids.lock().unwrap();
            if !ids.contains(&id) {
                ids.insert(id);
                break;
            }
        }
        id
    };

    let flattened_artists: Vec<_> = library.par_iter().map(|artist| {
        let generated_ids = Arc::clone(&generated_ids);
        CombinedItem {
            item_type: "Artist".to_string(),
            name: artist.name.clone(),
            id: artist.id.clone(),
            artist: Some(artist.clone()),
            album: None,
            song: None,
            acronym: None,
            generated_id: unique_uuid(&generated_ids),
        }
    }).collect();

    let extract_acronym = |name: &str| -> String {
        name.split_whitespace()
            .filter_map(|word| word.chars().next())
            .collect::<String>()
            .to_uppercase()
    };

    let flattened_albums: Vec<_> = library.par_iter().flat_map(|artist| {
        artist.albums.par_iter().map({
        let value = generated_ids.clone();
        move |album| {
            let generated_ids = Arc::clone(&value);
            CombinedItem {
                item_type: "Album".to_string(),
                name: album.name.clone(),
                id: album.id.clone(),
                artist: Some(artist.clone()),
                album: Some(album.clone()),
                song: None,
                acronym: Some(extract_acronym(&album.name)),
                generated_id: unique_uuid(&generated_ids),
            }
        }
        })
    }).collect();

    let flattened_songs: Vec<_> = library.par_iter().flat_map(|artist| {
        artist.albums.par_iter().flat_map({
        let value = generated_ids.clone();
        move |album| {
            album.songs.par_iter().map({
            let value = value.clone();
            move |song| {
                let generated_ids = Arc::clone(&value);
                CombinedItem {
                    item_type: "Song".to_string(),
                    name: song.name.clone(),
                    id: song.id.clone(),
                    album: Some(album.clone()),
                    artist: Some(artist.clone()),
                    song: Some(song.clone()),
                    acronym: None,
                    generated_id: unique_uuid(&generated_ids),
                }
            }
            })
        }
        })
    }).collect();

    let flattened_library = [flattened_artists, flattened_albums, flattened_songs].concat();

    println!("Done flattening");

    match serde_json::to_string(&flattened_library) {
      Ok(json_string) => HttpResponse::Ok().content_type("application/json; charset=utf-8").body(json_string),
      Err(e) => {
        println!("Serialization error: {:?}", e);
        HttpResponse::InternalServerError().finish()
      },
    }
}