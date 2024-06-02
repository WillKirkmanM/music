use std::time::Duration;
use reqwest::{header::{HeaderMap, AUTHORIZATION, CONTENT_TYPE, USER_AGENT}, Client};
use serde::Deserialize;
use tokio::io;
use tokio::{fs, time::sleep};
use tracing::{info, warn};

use crate::{structures::structures::{Album, Artist}, utils::websocket::log_to_ws};

#[derive(Debug, Deserialize)]
struct SearchResponse {
  best_match: BestMatch,
}

#[derive(Debug, Deserialize)]
struct BestMatch {
  items: Vec<ArtistItem>,
}

#[derive(Debug, Deserialize)]
struct ArtistItem {
  followers: Followers,
  images: Vec<Image>,
}

#[derive(Debug, Deserialize)]
struct Followers {
  total: u64,
}

#[derive(Debug, Deserialize)]
struct Image {
  url: String,
}

#[allow(non_snake_case)]
#[derive(Debug, Deserialize)]
struct TokenResponse {
  accessToken: String
}


pub async fn get_access_token() -> Result<String, Box<dyn std::error::Error>> {
  let client = reqwest::Client::new();
  let token_res: TokenResponse = client
    .get("https://open.spotify.com/get_access_token?reason=transport&productType=web_player")
    .header(reqwest::header::USER_AGENT, "MyApp/1.0")
    .send()
    .await?
    .json()
    .await?;
  Ok(token_res.accessToken)
}

async fn get_artist_metadata(artist: String, access_token: String) -> Result<(String, u64), Box<dyn std::error::Error>> {
  let client = reqwest::Client::new();
  let mut headers = HeaderMap::new();

  headers.insert(AUTHORIZATION, format!("Bearer {}", access_token).parse().unwrap());
  headers.insert(CONTENT_TYPE, "application/json".parse().unwrap());
  headers.insert(USER_AGENT, "MyApp/1.0".parse().unwrap());

  let url = format!("https://api.spotify.com/v1/search?type=artist&q={}&decorate_restrictions=false&best_match=true&include_external=audio&limit=1", artist);

  let response = client
    .get(&url)
    .headers(headers)
    .send()
    .await?;
  
  let body = response.text().await?;
  
  let res: SearchResponse = serde_json::from_str(&body)?;

  if let Some(artist) = res.best_match.items.get(0) {
    if let Some(image) = artist.images.get(0) {
      return Ok((image.url.clone(), artist.followers.total));
    }
  }

  Err("No artist found".into())
}

pub async fn process_artist(client: &Client, artist: &mut Artist, access_token: String) {
  if artist.icon_url.is_empty() {
    match get_artist_metadata(artist.name.clone(), access_token.clone()).await {
      Ok((icon_url, followers)) => {
        match download_and_store_icon_art(client, &icon_url, &artist.id.to_string()).await {
          Ok(path) => {
            artist.icon_url = path;
            artist.followers = followers;
            
            let log = format!("Icon art downloaded and stored for Artist: {}", artist.name);
            info!(log);
            log_to_ws(log).await.unwrap();
          },
          Err(e) => warn!("Failed to store icon art for Artist: {}. Error: {}", artist.name, e),
        }
      },
      Err(e) => warn!("Failed to fetch metadata for Artist: {}. Error: {}", artist.name, e),
    }
    sleep(Duration::from_secs(1)).await;
  }
}

pub async fn process_artists(client: &Client, library: &mut Vec<Artist>) {
  match get_access_token().await {
    Ok(access_token) => {
      for artist in library.iter_mut() {
        process_artist(client, artist, access_token.clone()).await;
      }
    },
    Err(e) => warn!("Failed to get access token. Error: {}", e),
  }
}

async fn download_and_store_icon_art(client: &Client, image_url: &str, artist_id: &str) -> Result<String, io::Error> {
  let image_response = client.get(image_url).send().await.unwrap();
  let image_bytes = image_response.bytes().await.unwrap();

  fs::create_dir_all("missing_icon_art").await?;
  let icon_url_file_path = format!("missing_icon_art/{}.jpg", artist_id);
  fs::write(&icon_url_file_path, image_bytes).await?;

  let absolute_path = fs::canonicalize(&icon_url_file_path).await?;
  let absolute_path_str = absolute_path.to_str().ok_or_else(|| io::Error::new(io::ErrorKind::Other, "Path conversion error"))?;
  let clean_path = absolute_path_str.trim_start_matches("\\\\?\\");
  Ok(clean_path.to_string())
}

async fn fetch_album_cover_url(client: &Client, artist_name: &str, album_name: &str) -> Option<String> {
  let query = format!("artist:\"{}\" AND release:\"{}\" AND (status:\"Official\" OR status:\"Promotion\")", artist_name, album_name);
  let url = format!("https://musicbrainz.org/ws/2/release/?query={}&fmt=json", query);
  if let Ok(response) = client.get(&url).send().await {
      if let Ok(body) = response.text().await {
          let v: serde_json::Value = serde_json::from_str(&body).unwrap_or_else(|_| "[]".into());
          if let Some(albums) = v["releases"].as_array() {
              for first_album in albums {
                  if let Some(album_id) = first_album["id"].as_str() {
                      let cover_art_url = format!("http://coverartarchive.org/release/{}", album_id);
                      if let Ok(cover_art_response) = client.get(&cover_art_url).send().await {
                          if cover_art_response.status().is_success() {
                              if let Ok(cover_art_body) = cover_art_response.text().await {
                                  let cover_art: serde_json::Value = serde_json::from_str(&cover_art_body).unwrap();
                                  if let Some(images) = cover_art["images"].as_array() {
                                      if let Some(first_image) = images.get(0) {
                                          return first_image["image"].as_str().map(|s| s.to_string());
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
  }
  None
}

async fn download_and_store_cover_art(client: &Client, image_url: &str, album_id: &str) -> Result<String, io::Error> {
  let image_response = client.get(image_url).send().await.unwrap();
  let image_bytes = image_response.bytes().await.unwrap();

  fs::create_dir_all("missing_cover_art").await?;
  let cover_url_file_path = format!("missing_cover_art/{}.jpg", album_id);
  fs::write(&cover_url_file_path, image_bytes).await?;

  let absolute_path = fs::canonicalize(&cover_url_file_path).await?;
  let absolute_path_str = absolute_path.to_str().ok_or_else(|| io::Error::new(io::ErrorKind::Other, "Path conversion error"))?;
  let clean_path = absolute_path_str.trim_start_matches("\\\\?\\");
  Ok(clean_path.to_string())
}

pub async fn process_albums(client: &Client, library: &mut Vec<Artist>) {
  for artist in library.iter_mut() {
    for album in &mut artist.albums {
      process_album(client, artist.name.clone(), album).await;
    }
  }
}

pub async fn process_album(client: &Client, artist_name: String, album: &mut Album) {
  if album.cover_url.is_empty() {
      let album_name = album.name.to_lowercase().replace("cd1", "").replace("cd2", "").to_string();

    if let Some(image_url) = fetch_album_cover_url(client, &artist_name, &album_name).await {
      match download_and_store_cover_art(client, &image_url, &album.id.to_string()).await {
        Ok(path) => {
          album.cover_url = path;

          let log = format!("Cover art downloaded and stored for Album: {}", album.name);
          info!(log);
          log_to_ws(log).await.unwrap()
        },
        Err(e) => warn!("Failed to store cover art for Album: {}. Error: {}", album.name, e),
      }
    } else {
      let log = format!("Cover art not found for Album: {}", album.name);
      warn!(log);
      log_to_ws(log).await.unwrap();
    }
    sleep(Duration::from_secs(1)).await;
  }
}