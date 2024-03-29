mod routes;
mod structures;
mod utils;

use actix_web::{HttpServer, App};

use routes::music::{
    songs_list,
    index_library,
    stream_song,
    format_contributing_artists_route
};

use tracing::Level;
use tracing_subscriber::FmtSubscriber;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("setting default subscriber failed");

    HttpServer::new(|| {
        App::new()
            .service(songs_list)
            .service(index_library)
            .service(stream_song)
            .service(format_contributing_artists_route)
    })
    .bind(("127.0.0.1", 3001))?
    .run()
    .await
}