use actix_web::{get, web, HttpResponse};
use rand::seq::SliceRandom;

use crate::structures::structures::{Album, Artist, Song};
use crate::utils::config::get_config;

#[get("/artist/random/{amount}")]
async fn get_random_artist(amount: web::Path<usize>) -> HttpResponse {
	let config = match get_config().await {
		Ok(config) => config,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let library: Vec<Artist> = match serde_json::from_str(&config) {
		Ok(library) => library,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let artists_with_albums: Vec<&Artist> = library.iter().filter(|artist| !artist.albums.is_empty()).collect();

	let mut random_artists = Vec::new();
	let mut rng = rand::thread_rng();

	for _ in 0..*amount {
		if artists_with_albums.is_empty() {
			break;
		}

		if let Some(artist) = artists_with_albums.choose(&mut rng) {
			random_artists.push(artist);
		}
	}

	HttpResponse::Ok().json(random_artists)
}

#[get("/artist/info/{id}")]
async fn get_artist_info(id: web::Path<String>) -> HttpResponse {
	let config = match get_config().await {
		Ok(config) => config,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let library: Vec<Artist> = match serde_json::from_str(&config) {
		Ok(library) => library,
		Err(_) => return HttpResponse::InternalServerError().finish(),
	};

	let artist_id = id.into_inner();

	for artist in library.iter() {
		if artist.id == artist_id {
			return HttpResponse::Ok().json(artist);
		}
	}

	HttpResponse::NotFound().finish()
}