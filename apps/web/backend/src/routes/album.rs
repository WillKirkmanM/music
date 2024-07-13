use actix_web::{get, web, HttpResponse};
use rand::seq::SliceRandom;
use serde::{Serialize, Deserialize};

use crate::structures::structures::{Album, Artist, Song};
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

		random_albums_with_artists.push(ResponseAlbum {
			id: random_album.id.clone(),
			name: random_album.name.clone(),
			cover_url: random_album.cover_url.clone(),
			songs: random_album.songs.clone(),
			first_release_date: random_album.first_release_date.clone(),
			musicbrainz_id: random_album.musicbrainz_id.clone(),
			wikidata_id: random_album.wikidata_id.clone(),
			primary_type: random_album.primary_type.clone(),
			description: random_album.description.clone(),
			artist_object: random_artist.to_owned().clone(),
		});
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