use std::{env, fs};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::path::Path;
use std::error::Error;

pub async fn get_config() -> Result<String, Box<dyn Error>> {
  let env = env::var("NODE_ENV").unwrap_or_else(|_| String::from("development"));
  let deployment_type = env::var("DEPLOYMENT_TYPE").unwrap_or_else(|_| String::from("containerless"));

  if !["production", "development"].contains(&env.as_str()) {
    return Err(format!("Invalid NODE_ENV: {}", env).into());
  }

  if !["docker", "containerless"].contains(&deployment_type.as_str()) {
    return Err(format!("Invalid DEPLOYMENT_TYPE: {}", deployment_type).into());
  }

  let mut config_path = Path::new("./apps/web/Config/music.json");
  if deployment_type == "docker" {
    config_path = Path::new("/Config/music.json");
  }

  let mut file = File::open(&config_path).await?;
  let mut contents = String::new();
  file.read_to_string(&mut contents).await?;

  Ok(contents)
}

pub async fn get_config_path() -> std::path::PathBuf {
  let deployment_type = env::var("DEPLOYMENT_TYPE").unwrap_or_else(|_| String::from("containerless"));
  let config_path = match deployment_type.as_str() {
    "docker" => Path::new("/Config/music.json"),
    _ => Path::new("./apps/web/Config/music.json"),
  };

  config_path.to_path_buf()
}

pub async fn save_config(indexed_json: &String) -> std::io::Result<()> {
    let config_path = get_config_path().await;
    let config_dir = config_path.parent().unwrap();
    let config_filename = config_path.file_stem().unwrap().to_str().unwrap();
    let config_extension = config_path.extension().unwrap().to_str().unwrap();

    let mut backup_number = 1;
    let mut backup_path = config_dir.join(format!("{}_{}.{}", config_filename, backup_number, config_extension));

    while backup_path.exists() {
        backup_number += 1;
        backup_path = config_dir.join(format!("{}_{}.{}", config_filename, backup_number, config_extension));
    }

    fs::rename(&config_path, &backup_path)?;

    let mut file = File::create(&config_path).await?;
    file.write_all(indexed_json.as_bytes()).await?;

    Ok(())
}