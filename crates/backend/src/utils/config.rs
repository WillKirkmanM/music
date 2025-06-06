use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::{env, error::Error, fs, path::Path};

use actix_web::web::{self, Json};
use actix_web::{get, HttpResponse, Responder};
use dotenvy::dotenv;
use rand::distributions::Alphanumeric;
use rand::Rng;
use serde_json::{from_str, json, to_string, Value};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use lazy_static::lazy_static;
use tokio::sync::RwLock;

use crate::structures::structures::Artist;

pub fn is_docker() -> bool {
    if env::var("RUNNING_IN_DOCKER").is_ok() {
        return true;
    }

    if Path::new("/.dockerenv").exists() {
        return true;
    }

    if let Ok(contents) = fs::read_to_string("/proc/self/cgroup") {
        if contents.contains("docker") {
            return true;
        }
    }

    if let Ok(contents) = fs::read_to_string("/proc/1/cgroup") {
        if contents.contains("containerd") || contents.contains("cri-o") {
            return true;
        }
    }

    if Path::new("/run/.containerenv").exists() {
        return true;
    }

    if let Ok(contents) = fs::read_to_string("/proc/self/mountinfo") {
        if contents.contains("/docker/") || contents.contains("/kubepods/") {
            return true;
        }
    }

    false
}

#[get("/get")]
pub async fn get() -> impl Responder {
    match get_config().await {
        Ok(config_str) => {
            match serde_json::from_str::<Value>(&config_str) {
                Ok(json) => Json(json),
                Err(_) => Json(json!({"error": "Failed to parse JSON"})),
            }
        },
        Err(_) => Json(json!({"error": "Failed to read config"})),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
      web::scope("/config")
          .service(get)
          .service(has_config)
    );
}

lazy_static! {
    pub static ref LIBRARY_CACHE: RwLock<Option<Arc<Vec<Artist>>>> = RwLock::new(None);
}

pub async fn get_config() -> Result<String, Box<dyn Error>> {
    let config_path = get_config_path();

    let mut file = File::open(config_path).await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;

    Ok(contents)
}

pub async fn fetch_library() -> Result<Arc<Vec<Artist>>, Box<dyn Error>> {
    let mut cache = LIBRARY_CACHE.write().await;
    if let Some(library) = &*cache {
        return Ok(library.clone());
    }

    let config = get_config().await?;
    let library: Vec<Artist> = from_str(&config)?;
    let library = Arc::new(library);
    *cache = Some(library.clone());
    Ok(library)
}

pub async fn save_library(library: &Arc<Vec<Artist>>) -> Result<(), Box<dyn Error>> {
    let config = to_string(&**library)?;
    save_config(&config, false).await?;
    refresh_cache().await?;
    Ok(())
}

pub async fn refresh_cache() -> Result<(), Box<dyn std::error::Error>> {
    let mut cache = LIBRARY_CACHE.write().await;
    *cache = None;
    drop(cache);
    fetch_library().await?;
    Ok(())
}

pub fn get_config_path() -> PathBuf {
    let path = if is_docker() {
        Path::new("/ParsonLabsMusic/Config/music.json").to_path_buf()
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ParsonLabs");
        path.push("Music");
        path.push("Config");
        path.push("music.json");
        path
    };

    if let Some(parent) = path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            eprintln!("Failed to create directories: {}", e);
        }
    }

    path
}

pub fn get_libraries_config_path() -> PathBuf {
    let path = if is_docker() {
        Path::new("/ParsonLabsMusic/Config/libraries.json").to_path_buf()
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ParsonLabs");
        path.push("Music");
        path.push("Config");
        path.push("libraries.json");
        path
    };

    if let Some(parent) = path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            eprintln!("Failed to create directories: {}", e);
        }
    }

    path
}

#[get("/has_config")]
async fn has_config() -> impl Responder {
    let config_path = get_config_path();

    if Path::new(&config_path).exists() {
        HttpResponse::Ok().body("Config file exists")
    } else {
        HttpResponse::NotFound().body("Config file not found")
    }
}

pub async fn save_config(indexed_json: &String, create_backup: bool) -> std::io::Result<()> {
    let config_path = get_config_path();

    let current_content = if config_path.exists() {
        fs::read_to_string(&config_path).ok()
    } else {
        None
    };

    if current_content.as_ref() == Some(indexed_json) {
        return Ok(());
    }

    let config_dir = config_path.parent().unwrap();
    let config_filename = config_path.file_stem().unwrap().to_str().unwrap();
    let config_extension = config_path.extension().unwrap().to_str().unwrap();

    if create_backup {
        let mut backup_number = 1;
        let mut backup_path = config_dir.join(format!("{}_{} (Backup).{}", config_filename, backup_number, config_extension));

        while backup_path.exists() {
            backup_number += 1;
            backup_path = config_dir.join(format!("{}_{} (Backup).{}", config_filename, backup_number, config_extension));
        }

        if config_path.exists() {
            fs::rename(&config_path, &backup_path)?;
        }
    }

    let mut file = File::create(&config_path).await?;
    file.write_all(indexed_json.as_bytes()).await?;

    Ok(())
}

pub fn get_icon_art_path() -> PathBuf {
    let path = if is_docker() {
        Path::new("/ParsonLabsMusic/Artist Icons").to_path_buf()
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ParsonLabs");
        path.push("Music");
        path.push("Artist Icons");
        path
    };

    if let Some(parent) = path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            eprintln!("Failed to create parent directories: {}", e);
        }
    } else {
        eprintln!("Parent directory is None for path: {:?}", path);
    }

    if let Err(e) = fs::create_dir_all(&path) {
        eprintln!("Failed to create artist icons directory: {}", e);
    }

    path
}

pub fn get_cover_art_path() -> PathBuf {
    let path = if is_docker() {
        Path::new("/ParsonLabsMusic/Album Covers").to_path_buf()
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ParsonLabs");
        path.push("Music");
        path.push("Album Covers");
        path
    };

    if let Some(parent) = path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            eprintln!("Failed to create parent directories: {}", e);
        }
    } else {
        eprintln!("Parent directory is None for path: {:?}", path);
    }

    if let Err(e) = fs::create_dir_all(&path) {
        eprintln!("Failed to create album covers directory: {}", e);
    }

    path
}

pub fn get_profile_picture_path() -> PathBuf {
    let path = if is_docker() {
        Path::new("/ParsonLabsMusic/Profile Pictures").to_path_buf()
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ParsonLabs");
        path.push("Music");
        path.push("Profile Pictures");
        path
    };

    if let Some(parent) = path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            eprintln!("Failed to create parent directories: {}", e);
        }
    } else {
        eprintln!("Parent directory is None for path: {:?}", path);
    }

    if let Err(e) = fs::create_dir_all(&path) {
        eprintln!("Failed to create album covers directory: {}", e);
    }

    path
}

lazy_static! {
    static ref JWT_SECRET: Mutex<String> = Mutex::new(generate_jwt_secret());
}

fn generate_jwt_secret() -> String {
    dotenv().ok();

    if let Ok(secret) = env::var("JWT_SECRET") {
        return secret;
    }

    let args: Vec<String> = env::args().collect();
    for i in 0..args.len() {
        if args[i] == "-s" || args[i] == "--jwt-secret" {
            if i + 1 < args.len() {
                return args[i + 1].clone();
            } else {
                eprintln!("Error: No JWT secret provided after {}", args[i]);
                break;
            }
        }
    }

    let secure_secret: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(64)
        .map(char::from)
        .collect();

    secure_secret
}

pub fn get_jwt_secret() -> String {
    JWT_SECRET.lock().unwrap().clone()
}