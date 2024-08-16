mod routes;
mod structures;
mod utils;

use std::env;

use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpServer, route};
use actix_web_httpauth::middleware::HttpAuthentication;
use routes::authentication::admin_guard;
use routes::authentication::refresh;
use routes::search::ensure_meilisearch_is_installed;
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
use utils::database::database::establish_connection;
use utils::database::database::migrations_ran;
use utils::database::database::run_migrations;
use utils::websocket::ws;
use utils::globals::GLOBAL_SESSION;

use rust_embed::RustEmbed;
use actix_web_rust_embed_responder::{EmbedResponse, IntoResponse};
use rust_embed::EmbeddedFile;

#[derive(RustEmbed)]
#[folder = "../../apps/web/out"]
struct Embed;

#[route("/{path:.*}", method = "GET", method = "HEAD")]
async fn serve_assets(path: web::Path<String>) -> EmbedResponse<EmbeddedFile> {
    let mut path = if path.is_empty() {
        "index.html".to_string()
    } else {
        path.to_string()
    };

    if Embed::get(&path).is_none() && !path.ends_with(".html") {
        let new_path = format!("{}/index.html", path);
        if Embed::get(&new_path).is_some() {
            path = new_path;
        }
    }

    Embed::get(&path).into_response()
}

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

    task::spawn(async move {
        if let Err(e) = ensure_meilisearch_is_installed().await {
            eprintln!("Failed to ensure Meilisearch is installed: {}", e);
        }
    
        if !migrations_ran() {
            if let Err(e) = run_migrations() {
                eprintln!("Failed to run migrations: {}", e);
            }
        }
    
        if let Err(e) = populate_search_data().await {
            eprintln!("Failed to populate search data: {}", e);
        }
    });
    
    HttpServer::new(move || {
        let authentication = HttpAuthentication::with_fn(validator);
        let admin = HttpAuthentication::with_fn(admin_guard);
    
        let protected = web::scope("/api")
            .wrap(authentication)
            .service(songs_list)
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

        let admin_routes = web::scope("/library")
            .wrap(admin)
            .service(process_library);
        
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
                    .supports_credentials()
            )
            .wrap(middleware::Compress::default())
            .wrap(middleware::Logger::default())
            .service(
                web::scope("/api/auth")
                .service(login)
                .service(register)
                .service(refresh)
            )
            .service(image)
            .route("/ws", web::get().to(ws))
            .service(
                web::scope("/api/s")
                .configure(server::configure)
            )
            .service(protected)
            .service(admin_routes)
            .service(serve_assets)
    })
    .workers(8)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}