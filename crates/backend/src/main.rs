mod routes;
mod structures;
mod utils;

use std::env;

use actix_cors::Cors;
use actix_files::Files;
use actix_web::{middleware, web, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;
use tokio::task;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

use routes::album;
use routes::artist;
use routes::authentication::{login, register, validator};
use routes::filesystem;
use routes::image::image;
use routes::music::{
    format_contributing_artists_route, index_library_no_cover_url, process_library, songs_list,
    stream_song, test,
};
use routes::playlist;
use routes::search::{self, populate_search_data};
use routes::server;
use routes::social;
use routes::song;
use routes::user;

use utils::config;
use utils::websocket::ws;

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

    task::spawn(async {
        if let Err(e) = populate_search_data().await {
            eprintln!("Failed to populate search data: {}", e);
        }
    });
    
    HttpServer::new(move || {

        let cors = Cors::permissive();

        let authentication = HttpAuthentication::with_fn(validator);
    
        let protected = web::scope("/api")
            .wrap(authentication)
            .service(songs_list)
            .service(process_library)
            .service(test)
            .service(stream_song)
            .service(format_contributing_artists_route)
            .service(index_library_no_cover_url)
            .configure(artist::configure)
            .configure(album::configure)
            .configure(song::configure)
            .configure(user::configure)
            .configure(filesystem::configure)
            .configure(search::configure)
            .configure(social::configure)
            .configure(playlist::configure)
            .configure(config::configure);
        
        App::new()
            .wrap(cors)
            .wrap(middleware::Compress::default())
            .wrap(middleware::Logger::default())
            .service(
                web::scope("/api/auth")
                .service(login)
                .service(register)
            )
            .service(image)
            .route("/ws", web::get().to(ws))
            .service(
                web::scope("/api/s")
                .configure(server::configure)
            )
            .service(protected)
            .service(Files::new("/", "./apps/web/out").index_file("index.html"))
    })
    .workers(8)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}