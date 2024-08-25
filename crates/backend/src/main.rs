mod routes;
mod structures;
mod utils;

use std::env;
use std::error::Error;

use actix_cors::Cors;
use actix_web::HttpResponse;
use actix_web::{middleware, web, App, HttpServer};
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
use utils::database::database::migrations_ran;
use utils::database::database::run_migrations;
// use utils::update::check_for_updates;
use utils::websocket::ws;

use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "../../apps/web/out"]
struct Asset;

async fn serve_embedded_file(path: web::Path<String>) -> Result<HttpResponse, Box<dyn Error>> {
    let mut file_path = path.into_inner();

    if let Some(content) = Asset::get(&file_path) {
        let body = content.data.into_owned();
        let mime_type = mime_guess::from_path(&file_path).first_or_octet_stream();
        return Ok(HttpResponse::Ok()
            .content_type(mime_type.as_ref())
            .body(body));
    }

    if file_path.is_empty() {
        file_path = "index.html".to_string();
    } else {
        if !file_path.ends_with('/') {
            file_path.push('/');
        }
        file_path.push_str("index.html");
    }

    match Asset::get(&file_path) {
        Some(content) => {
            let body = content.data.into_owned();
            let mime_type = mime_guess::from_path(&file_path).first_or_octet_stream();
            Ok(HttpResponse::Ok()
                .content_type(mime_type.as_ref())
                .body(body))
        }
        None => {
            Ok(HttpResponse::NotFound().body("404 Not Found!"))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("setting default subscriber failed");

    // let update_result = task::spawn_blocking(|| check_for_updates())
    //     .await
    //     .expect("Checking for Updates Failed! Are you connected to the internet?");

    // if let Err(e) = update_result {
    //     eprintln!("[ERROR] {}", e);
    //     std::process::exit(1);
    // }

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
            .route("/{filename:.*}", web::get().to(serve_embedded_file))
    })
    .workers(8)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}