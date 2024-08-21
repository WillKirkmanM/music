use std::path::PathBuf;
use std::{env, error::Error, fs, path::Path};

use actix_web::web::{self, Json};
use actix_web::{get, Responder};
use serde_json::{json, Value};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tracing::error;

pub fn is_docker() -> bool {
  if Path::new("/.dockerenv").exists() {
      return true;
  }

  match fs::read_to_string("/proc/self/cgroup") {
      Ok(contents) => contents.contains("docker"),
      Err(_) => false,
  }
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
    );
}

pub async fn get_config() -> Result<String, Box<dyn Error>> {
    let config_path = get_config_path().await;

    let mut file = File::open(config_path).await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;

    Ok(contents)
}

pub async fn get_config_path() -> PathBuf {
    if is_docker() {
        return Path::new("/ParsonLabsMusic/Config/music.json").to_path_buf()
    }

    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("ParsonLabs");
    path.push("Music");
    path.push("Config");
    if let Err(e) = fs::create_dir_all(&path) {
        eprintln!("Failed to create directories: {}", e);
    }
    path.push("music.json");
    path
}

pub async fn save_config(indexed_json: &String) -> std::io::Result<()> {
  let config_path = get_config_path().await;
  let config_dir = config_path.parent().unwrap();
  let config_filename = config_path.file_stem().unwrap().to_str().unwrap();
  let config_extension = config_path.extension().unwrap().to_str().unwrap();

  let mut backup_number = 1;
  let mut backup_path = config_dir.join(format!("{}_{} (Backup).{}", config_filename, backup_number, config_extension));

  while backup_path.exists() {
    backup_number += 1;
    backup_path = config_dir.join(format!("{}_{} (Backup).{}", config_filename, backup_number, config_extension));
  }

  if config_path.exists() {
    fs::rename(&config_path, &backup_path)?;
  }

  let mut file = File::create(&config_path).await?;
  file.write_all(indexed_json.as_bytes()).await?;

  Ok(())
}

pub fn get_icon_art_path() -> PathBuf {
    if is_docker() {
        Path::new("/ParsonLabsMusic/Artist Icons").to_path_buf()
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ParsonLabs");
        path.push("Music");
        path.push("Artist Icons");
        if let Err(e) = fs::create_dir_all(&path) {
            eprintln!("Failed to create directories: {}", e);
        }
        path
    }
}

pub fn get_cover_art_path() -> PathBuf {
    if is_docker() {
        Path::new("/ParsonLabsMusic/Album Covers").to_path_buf()
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ParsonLabs");
        path.push("Music");
        path.push("Album Covers");
        if let Err(e) = fs::create_dir_all(&path) {
            eprintln!("Failed to create directories: {}", e);
        }
        path
    }
}

pub fn get_jwt_secret() -> String {
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

    error!("A JWT Secret was not found! It is highly recommended to set it using -s or --jwt-secret or the JWT_SECRET environment variable.");

    "secret".to_string()
}