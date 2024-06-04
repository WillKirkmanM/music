use std::{error::Error, time::Duration};
use reqwest::{header::{HeaderMap, AUTHORIZATION, CONTENT_TYPE, USER_AGENT}, Client};
use serde::Deserialize;
use serde_json::Value;
use tokio::{io, time};
use tokio::{fs, time::sleep};
use tracing::{info, warn};
use regex::Regex;
use serde::ser::StdError;

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

async fn get_artist_metadata(client: &Client, artist_name: &str, access_token: String) -> Result<(String, u64), Box<dyn StdError + Send>> {
  let mut headers = HeaderMap::new();

  headers.insert(AUTHORIZATION, format!("Bearer {}", access_token).parse().unwrap());
  headers.insert(CONTENT_TYPE, "application/json".parse().unwrap());
  headers.insert(USER_AGENT, "MyApp/1.0".parse().unwrap());

  let url = format!("https://api.spotify.com/v1/search?type=artist&q={}&decorate_restrictions=false&best_match=true&include_external=audio&limit=1", artist_name);

  let response = client
    .get(&url)
    .headers(headers)
    .send()
    .await
    .unwrap();
  
  let body = response.text().await.unwrap();
  
  let res: SearchResponse = serde_json::from_str(&body).unwrap();

  if let Some(artist) = res.best_match.items.get(0) {
    if let Some(image) = artist.images.get(0) {
      return Ok((image.url.clone(), artist.followers.total));
    }
  }

  Err(Box::new(std::io::Error::new(std::io::ErrorKind::Other, "No artist found")))
}

pub async fn process_artist(client: &Client, artist: &mut Artist, access_token: String) {
  if artist.icon_url.is_empty() {
    let client1 = client.clone();
    let artist_name1 = artist.name.clone();
    let wikipedia_future = tokio::spawn(async move {
      fetch_wikipedia_extract(&client1, &artist_name1, None, None).await
    });

    let client2 = client.clone();
    let artist_name2 = artist.name.clone();
    let metadata_future = tokio::spawn(async move {
      get_artist_metadata(&client2, &artist_name2, access_token.clone()).await
    });

    let wikipedia_extract = wikipedia_future.await.unwrap();
    let metadata_result = metadata_future.await.unwrap();
    
    if let Some(wikipedia_extract) = wikipedia_extract {
      artist.description = wikipedia_extract;
    }
    if let Ok(metadata) = metadata_result {
      match download_and_store_icon_art(client, &metadata.0, &artist.id.to_string()).await {
        Ok(path) => {
          artist.icon_url = path;
          artist.followers = metadata.1;
    
          let log = format!("Icon art and metadata downloaded and stored for Artist: {}", artist.name);
          info!(log);
          log_to_ws(log).await.unwrap()
        },
        Err(e) => warn!("Failed to store icon art for Artist: {}. Error: {}", artist.name, e),
      }
    } else {
      let log = format!("Icon art not found for Artist: {}", artist.name);
      warn!(log);
      log_to_ws(log).await.unwrap();
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


async fn fetch_album_metadata(client: &Client, artist_name: &str, album_name: &str) -> AlbumMetadata {
  let query = format!("artist:\"{}\" AND release:\"{}\" AND (status:\"Official\" OR status:\"Promotion\")", artist_name, album_name);
  
  let url = format!("https://musicbrainz.org/ws/2/release-group/?query={}&fmt=json&limit=10", query);
  let album_metadata = fetch_musicbrainz_metadata(client, &url).await;

  if album_metadata.is_err() {
    let log_message = format!("Didn't find the album: {} in release group, trying release...", album_name);
    info!("{}", log_message);
    log_to_ws(log_message).await.unwrap();

    let url = format!("https://musicbrainz.org/ws/2/release/?query={}&fmt=json&limit=10", query);
    let album_metadata = fetch_musicbrainz_metadata(client, &url).await;
    album_metadata.unwrap()
  } else {
    album_metadata.unwrap()
  }
}


async fn fetch_wikipedia_extract(client: &Client, artist_name: &str, album_name: Option<&str>, wikidata_id: Option<&str>) -> Option<String> {
  if let Some(wikidata_id) = wikidata_id {
    let wikidata_url = format!("https://www.wikidata.org/wiki/Special:EntityData/{}.json", wikidata_id);
    if let Ok(response) = client.get(&wikidata_url).send().await {
      if let Ok(body) = response.text().await {
        let v: Value = serde_json::from_str(&body).unwrap_or_else(|_| "[]".into());
        if let Some(wikipedia_title) = v["entities"][wikidata_id]["sitelinks"]["enwiki"]["title"].as_str() {
          return fetch_wikipedia_page_extract(client, wikipedia_title).await;
        }
      }
    }
  }

  let query = match album_name {
    Some(album) => format!("{} (Album)", album),
    None => format!("{} Artist", artist_name),
  };
  let search_url = format!("https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch={}&srlimit=1", query);
  if let Ok(response) = client.get(&search_url).send().await {
    if let Ok(body) = response.text().await {
      let v: Value = serde_json::from_str(&body).unwrap_or_else(|_| "[]".into());
      if let Some(page_title) = v["query"]["search"][0]["title"].as_str() {
        return fetch_wikipedia_page_extract(client, page_title).await;
      }
    }
  }

  None
}

async fn fetch_wikipedia_page_extract(client: &Client, page_title: &str) -> Option<String> {
  time::sleep(Duration::from_secs(1)).await;
  let extract_url = format!("https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&format=json&titles={}", page_title);
  if let Ok(response) = client.get(&extract_url).send().await {
    if let Ok(body) = response.text().await {
      let v: Value = serde_json::from_str(&body).unwrap_or_else(|_| "[]".into());
      if let Some(pages) = v["query"]["pages"].as_object() {
        for page in pages.values() {
          if let Some(extract) = page["extract"].as_str() {
            let re = Regex::new(r"<.*?>|\n").unwrap();
            let clean_extract = re.replace_all(extract, "").to_string();
          
            let re_amp = Regex::new(r"&amp;").unwrap();
            let without_amp = re_amp.replace_all(&clean_extract, "&").to_string();
            let re_lt = Regex::new(r"&lt;").unwrap();
            let without_lt = re_lt.replace_all(&without_amp, "<").to_string();
            let re_gt = Regex::new(r"&gt;").unwrap();
            let without_gt = re_gt.replace_all(&without_lt, ">").to_string();
            let re_quot = Regex::new(r"&quot;").unwrap();
            let without_quot = re_quot.replace_all(&without_gt, "\"").to_string();
          
            let re_backticks = Regex::new(r"(?m)^`|`$").unwrap();
            let final_extract = re_backticks.replace_all(&without_quot, "").to_string(); 

            return Some(final_extract);
          }
        }
      }
    }
  }
  time::sleep(Duration::from_secs(1)).await;
  None
}

pub struct AlbumMetadata {
  pub cover_url: String,
  pub first_release_date: String,
  pub musicbrainz_id: String,
  pub wikidata_id: Option<String>,
  pub primary_type: String,
}
async fn fetch_musicbrainz_metadata(client: &Client, url: &str) -> Result<AlbumMetadata, Box<dyn std::error::Error>> {
  let response = client.get(url).send().await?;
  let body = response.text().await?;
  let v: serde_json::Value = serde_json::from_str(&body)?;

  let empty_vec = Vec::new();
  let release_groups = if v["release-groups"].is_array() {
    v["release-groups"].as_array().unwrap()
  } else if v["releases"].is_array() {
    v["releases"].as_array().unwrap()
  } else {
    &empty_vec
  };


  for release in release_groups {
    let id = release["id"].as_str().unwrap_or("");
    let is_release_group = url.contains("release-group");
    let cover_art_url = if is_release_group {
      format!("http://coverartarchive.org/release-group/{}", id)
    } else {
      format!("http://coverartarchive.org/release/{}", id)
    };

    time::sleep(Duration::from_secs(1)).await;

    let cover_art_response = client.get(&cover_art_url).send().await?;
    let cover_art_body = if cover_art_response.status().is_success() {
      cover_art_response.text().await?
    } else {
      "".to_string()
    };
    let cover_art: serde_json::Value = serde_json::from_str(&cover_art_body)?;
    let images = cover_art["images"].as_array().unwrap_or(&empty_vec);
    let first_image = images.get(0).unwrap_or(&serde_json::Value::Null);
    let cover_url = first_image["image"].as_str().unwrap_or("");

    time::sleep(Duration::from_secs(1)).await;

    let release_url = if is_release_group {
      format!("https://musicbrainz.org/ws/2/release-group/{}?inc=aliases+artist-credits+releases+url-rels&fmt=json", id)
    } else {
      format!("https://musicbrainz.org/ws/2/release/{}?inc=aliases+artist-credits+releases+url-rels&fmt=json", id)
    };
    let release_response = client.get(&release_url).send().await?;
    let release_body = release_response.text().await?;
    let release: serde_json::Value = serde_json::from_str(&release_body)?;

    let first_release_date = if is_release_group {
      release["first-release-date"].as_str().unwrap_or("")
    } else {
      release["date"].as_str().unwrap_or("")
    };
    let primary_type = if is_release_group {
      release["primary-type"].as_str().unwrap_or("")
    } else {
      release["status"].as_str().unwrap_or("")
    };

    let wikidata_id = release["relations"].as_array()
      .and_then(|relations| {
        relations.iter().find_map(|relation| {
          if relation["type"].as_str() == Some("wikidata") {
            relation["url"]["resource"].as_str()
              .and_then(|wikidata_url| wikidata_url.split('/').last())
              .map(|id| id.to_string())
          } else {
            None
          }
        })
      })
      .unwrap_or("".to_string());

    return Ok(AlbumMetadata {
      cover_url: cover_url.to_string(),
      first_release_date: first_release_date.to_string(),
      musicbrainz_id: id.to_string(),
      wikidata_id: Some(wikidata_id),
      primary_type: primary_type.to_string(),
    });
  }

  Ok(AlbumMetadata {
    cover_url: "".to_string(),
    first_release_date: "".to_string(),
    musicbrainz_id: "".to_string(),
    wikidata_id: Some("".to_string()),
    primary_type: "".to_string(),
  })
}

async fn download_and_store_cover_art(client: &Client, image_url: &str, album_id: &str) -> Result<String, io::Error> {
  let image_response = client.get(image_url).send().await.map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
  let image_bytes = image_response.bytes().await.map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

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
  let album_name = album.name.to_lowercase().replace("cd1", "").replace("cd2", "").to_string();

  let metadata = fetch_album_metadata(client, &artist_name, &album_name).await;

  if let Some(wikidata_id) = metadata.wikidata_id.clone() {
      if let Some(wikipedia_extract) = fetch_wikipedia_extract(client, &album_name, Some(&artist_name), Some(&wikidata_id)).await {
          album.description = wikipedia_extract;
      } else {
          warn!("Failed to fetch Wikipedia extract for Album: {}", album.name);
      }
  }

  if album.cover_url.is_empty() {
    match download_and_store_cover_art(client, &metadata.cover_url, &album.id.to_string()).await {
        Ok(path) => {
            album.cover_url = path;
            let log = format!("Cover art downloaded and stored for Album: {}", album.name);
            info!(log);
            log_to_ws(log).await.unwrap_or_else(|e| warn!("Failed to log to ws: {}", e));
        },
        Err(e) => warn!("Failed to store cover art for Album: {}. Error: {}", album.name, e),
    }
  } else {
    let log = format!("Cover art already exists for Album: {}", album.name);
    warn!(log);
    log_to_ws(log).await.unwrap_or_else(|e| warn!("Failed to log to ws: {}", e));
  }

  album.first_release_date = metadata.first_release_date;
  album.musicbrainz_id = metadata.musicbrainz_id;
  album.wikidata_id = metadata.wikidata_id;
  album.primary_type = metadata.primary_type;

  let log = format!("Metadata updated for Album: {}", album.name);
  info!(log);
  log_to_ws(log).await.unwrap_or_else(|e| warn!("Failed to log to ws: {}", e));

  sleep(Duration::from_secs(1)).await;
}