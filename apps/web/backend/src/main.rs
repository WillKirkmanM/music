mod routes;
mod structures;
mod utils;

use actix_web::{HttpServer, App};
use std::env;

use routes::music::{
    songs_list,
    index_library,
    stream_song,
    format_contributing_artists_route
};

use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("setting default subscriber failed");

    let mut port = 3001; // Default port

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

    HttpServer::new(|| {
        App::new()
            .service(songs_list)
            .service(index_library)
            .service(stream_song)
            .service(format_contributing_artists_route)
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}