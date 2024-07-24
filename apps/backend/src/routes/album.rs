use actix_web::{get, web, HttpResponse};
use rand::seq::{IteratorRandom, SliceRandom};
use serde::{Serialize, Deserialize};

use crate::structures::structures::{Artist, Song};
use crate::utils::config::get_config;

#[derive(Serialize, Deserialize, Clone)]
pub struct ResponseAlbum {
    pub id: String,
    pub name: String,
    pub cover_url: String,
    pub songs: Vec<Song>,
    pub first_release_date: String,
    pub musicbrainz_id: String,
    pub wikidata_id: Option<String>,
    pub primary_type: String,
    pub description: String,
		pub artist_object: Artist
}

#[get("/album/random/{amount}")]
async fn get_random_album(amount: web::Path<usize>) -> HttpResponse {
	let config = match get_config().await {
		Ok(config) => config,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let library: Vec<Artist> = match serde_json::from_str(&config) {
		Ok(library) => library,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let mut random_albums_with_artists = Vec::new();
	let mut rng = rand::thread_rng();

	for _ in 0..*amount {
		let mut valid_artist = None;
		let mut valid_album = None;

		for _ in 0..10 {
			if let Some(artist) = library.iter().choose(&mut rng) {
				if !artist.albums.is_empty() {
					valid_artist = Some(artist);
					break;
				}
			}
		}

		if let Some(artist) = valid_artist {
			if let Some(album) = artist.albums.choose(&mut rng) {
				valid_album = Some(album);
			}
		}

		if let Some(album) = valid_album {
			random_albums_with_artists.push(ResponseAlbum {
				id: album.id.clone(),
				name: album.name.clone(),
				cover_url: album.cover_url.clone(),
				songs: album.songs.clone(),
				first_release_date: album.first_release_date.clone(),
				musicbrainz_id: album.musicbrainz_id.clone(),
				wikidata_id: album.wikidata_id.clone(),
				primary_type: album.primary_type.clone(),
				description: album.description.clone(),
				artist_object: valid_artist.unwrap().to_owned().clone(),
			});
		}
	}

	HttpResponse::Ok().json(random_albums_with_artists)
}

#[get("/album/info/{id}")]
async fn get_album_info(id: web::Path<String>) -> HttpResponse {
	let config = match get_config().await {
		Ok(config) => config,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let library: Vec<Artist> = match serde_json::from_str(&config) {
		Ok(library) => library,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let album_id = id.into_inner();

	for artist in library.iter() {
		for album in artist.albums.iter() {
			if album.id == album_id {
				return HttpResponse::Ok().json(ResponseAlbum {
					id: album.id.clone(),
					name: album.name.clone(),
					cover_url: album.cover_url.clone(),
					songs: album.songs.clone(),
					first_release_date: album.first_release_date.clone(),
					musicbrainz_id: album.musicbrainz_id.clone(),
					wikidata_id: album.wikidata_id.clone(),
					primary_type: album.primary_type.clone(),
					description: album.description.clone(),
					artist_object: artist.clone(),
				});
			}
		}
	}

	HttpResponse::NotFound().finish()
}