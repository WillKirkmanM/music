mod routes;
mod structures;
mod utils;

use actix_web::{App, HttpServer};
use routes::album::{get_album_info, get_random_album};
use routes::artist::{get_artist_info, get_random_artist};
use routes::image::image;
use routes::song::{get_random_song, get_song_info};
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

use utils::websocket::start_ws;

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
        start_ws().await.unwrap()
    });

    
    HttpServer::new(move || {
        App::new()
            .service(home)
            .service(songs_list)
            .service(process_library)
            .service(test)
            .service(stream_song)
            .service(format_contributing_artists_route)
            .service(image)
            .service(index_library_no_cover_url)
            .service(get_random_artist)
            .service(get_artist_info)
            .service(get_random_album)
            .service(get_album_info)
            .service(get_random_song)
            .service(get_song_info)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
