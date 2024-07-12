use actix_web::{get, web, HttpResponse};
use rand::seq::SliceRandom;

use crate::structures::structures::{Album, Artist, Song};
use crate::utils::config::get_config;

#[get("/album/random/{amount}")]
async fn get_random_album(amount: web::Path<usize>) -> HttpResponse {
	let config = get_config().await.unwrap();

	let library: Vec<Artist> = match serde_json::from_str(&config) {
		Ok(library) => library,
		Err(_) => return HttpResponse::Ok().json(Vec::<Album>::new()),
	};

	let mut random_albums = Vec::new();
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

		random_albums.push(random_album.clone());
	}

	HttpResponse::Ok().json(random_albums)
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
				return HttpResponse::Ok().json(album);
			}
		}
	}

	HttpResponse::NotFound().finish()
}