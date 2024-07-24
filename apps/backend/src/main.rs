mod routes;
mod structures;
mod utils;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;
use routes::album::{get_album_info, get_random_album};
use routes::artist::{get_artist_info, get_random_artist};
use routes::authentication::{login, register, validator};
use routes::image::image;
use routes::search::populate_search;
use routes::song::{get_random_song, get_song_info};
use utils::database::database::establish_connection;
use std::env;

use routes::index::home;
use routes::music::{
    songs_list,
    process_library,
    stream_song,
    format_contributing_artists_route,
    test,
    index_library_no_cover_url
};

use utils::websocket::{start_ws, ws};

use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("setting default subscriber failed");

    
    let mut port = 3001;

    let args: Vec<String> = env::args().collect();
    for i in 0..args.len() {
        if args[i] == "-p" || args[i] == "--port" {
            if i + 1 < args.len() {
                port = args[i + 1].parse().unwrap_or(3001);
            }
            break;
        }
    }
    
    
    info!("Starting server on port {}", port); 

    tokio::spawn(async move {
        start_ws().await.unwrap();
    });

    HttpServer::new(move || {
        let cors = Cors::permissive();
        let authentication = HttpAuthentication::with_fn(validator);

        let protected = web::scope("")
        .wrap(authentication)
        .service(songs_list)
        .service(process_library)
        .service(test)
        .service(stream_song)
        .service(format_contributing_artists_route)
        .service(image)
        .service(populate_search)
        .service(index_library_no_cover_url)
        .service(get_random_artist)
        .service(get_artist_info)
        .service(get_random_album)
        .service(get_album_info)
        .service(get_random_song)
        .service(get_song_info);
    
    
        App::new()
            .wrap(cors)
            .service(home)
            .service(login)
            .service(register)
            .route("/ws", web::get().to(ws))
            .service(protected)
        })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
