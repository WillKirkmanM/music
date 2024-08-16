use std::{path::Path, time::Duration};

use regex::Regex;
use reqwest::{
    header::{HeaderMap, AUTHORIZATION, CONTENT_TYPE, USER_AGENT},
    Client,
};
use serde::Deserialize;
use serde_json::Value;
use tokio::{fs, io, time::sleep};
use tracing::{info, warn};

use crate::{
    structures::structures::{Album, Artist},
    utils::websocket::log_to_ws,
};

use super::config::{get_cover_art_path, get_icon_art_path};

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

async fn get_artist_metadata(client: &Client, artist_name: &str, access_token: String) -> Option<(String, u64)> {
  let mut headers = HeaderMap::new();

  headers.insert(AUTHORIZATION, format!("Bearer {}", access_token).parse().unwrap());
  headers.insert(CONTENT_TYPE, "application/json".parse().unwrap());
  headers.insert(USER_AGENT, "MyApp/1.0".parse().unwrap());

  let url = format!("https://api.spotify.com/v1/search?type=artist&q={}&decorate_restrictions=false&best_match=true&include_external=audio&limit=1", artist_name);

  let response = match client.get(&url).headers(headers).send().await {
    Ok(response) => response,
    Err(_) => {
      warn!("Failed to send request for artist: {}", artist_name);
      return None;
    },
  };

  let body = match response.text().await {
    Ok(body) => body,
    Err(_) => {
      warn!("Failed to read response body for artist: {}", artist_name);
      return None;
    },
  };

  let res: SearchResponse = match serde_json::from_str(&body) {
    Ok(res) => res,
    Err(_) => {
      warn!("Failed to parse response body for artist: {}", artist_name);
      return None;
    },
  };

  if let Some(artist) = res.best_match.items.get(0) {
    if let Some(image) = artist.images.get(0) {
      return Some((image.url.clone(), artist.followers.total));
    }
  }

  warn!("No artist found for: {}", artist_name);
  None
}

pub async fn process_artist(client: &Client, artist: &mut Artist, access_token: String) {
  // let icon_path = Path::new(&icon_path_formatted);

  let client1 = client.clone();
  let artist_name1 = artist.name.clone();
  let wikipedia_future = tokio::spawn(async move {
    fetch_wikipedia_extract(&client1, &artist_name1, None, None).await
  });

  let wikipedia_extract = wikipedia_future.await.unwrap();
  if let Some(wikipedia_extract) = wikipedia_extract {
    artist.description = wikipedia_extract;
    let log = format!("Wikipedia extract downloaded for Artist: {}", artist.name);
    info!(log);
    log_to_ws(log).await.unwrap();
  }

  // if !icon_path.exists() {
    let client2 = client.clone();
    let artist_name2 = artist.name.clone();
    let metadata_future = tokio::spawn(async move {
      get_artist_metadata(&client2, &artist_name2, access_token.clone()).await
    });

    let metadata_result = metadata_future.await.unwrap();

    if let Some(metadata) = metadata_result {
      match download_and_store_icon_art(client, &metadata.0, &artist.id.to_string()).await {
        Ok(path) => {
          artist.icon_url = path;
          artist.followers = metadata.1;

          let log = format!("Icon art downloaded and stored for Artist: {}", artist.name);
          info!(log);
          log_to_ws(log).await.unwrap();
        },
        Err(e) => warn!("Failed to store icon art for Artist: {}. Error: {}", artist.name, e),
      }
    } else {
      let log = format!("Icon art not found for Artist: {}", artist.name);
      warn!(log);
      log_to_ws(log).await.unwrap();
    }

    sleep(Duration::from_secs(1)).await;
  // }
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

  let icon_art_path = get_icon_art_path();
  let icon_url_path = icon_art_path.join(format!("{}.jpg", artist_id));
  let icon_url_file_path = icon_url_path.to_str().map(|s| s.to_owned()).unwrap();
  fs::write(&icon_url_file_path, image_bytes).await?;

  let absolute_path = fs::canonicalize(&icon_url_file_path).await?;
  let absolute_path_str = absolute_path.to_str().ok_or_else(|| io::Error::new(io::ErrorKind::Other, "Path conversion error"))?;
  let clean_path = absolute_path_str.trim_start_matches("\\\\?\\");
  Ok(clean_path.to_string())
}


async fn fetch_album_metadata(client: &Client, artist_name: &str, album_name: &str, album_id: String) -> AlbumMetadata {
  let status = "AND (status:\"Official\" OR status:\"Promotion\")";
  let query_with_status = format!("artist:\"{}\" AND release:\"{}\" {}", artist_name, album_name, status);
  let query_without_status = format!("artist:\"{}\" AND release:\"{}\"", artist_name, album_name);

  let cover_art_path = get_cover_art_path();
  let cover_url_path = cover_art_path.join(format!("{}.jpg", album_id));
  let cover_url_path = Path::new(&cover_url_path);
  let cover_art_already_downloaded = cover_url_path.exists();


  let url_with_status = format!("https://musicbrainz.org/ws/2/release-group/?query={}&fmt=json&limit=10", query_with_status);
  let url_without_status = format!("https://musicbrainz.org/ws/2/release-group/?query={}&fmt=json&limit=10", query_without_status);

  let mut album_metadata = fetch_musicbrainz_metadata(client, &url_with_status, cover_art_already_downloaded, &album_id).await;

  if album_metadata.is_err() || album_metadata.as_ref().unwrap().cover_url.is_empty() {
    let log_message = format!("Didn't find the album: {} in release group with status, trying without status...", album_name);
    info!("{}", log_message);
    log_to_ws(log_message).await.unwrap();

    sleep(Duration::from_secs(1)).await;
    album_metadata = fetch_musicbrainz_metadata(client, &url_without_status, cover_art_already_downloaded, &album_id).await;
  }

  if album_metadata.is_err() {
    let log_message = format!("Didn't find the album: {} in release group, trying release...", album_name);
    info!("{}", log_message);
    log_to_ws(log_message).await.unwrap();

    let url = format!("https://musicbrainz.org/ws/2/release/?query={}&fmt=json&limit=10", query_without_status);
    album_metadata = fetch_musicbrainz_metadata(client, &url, cover_art_already_downloaded, &album_id).await;
  }

  album_metadata.unwrap_or_default()
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
  sleep(Duration::from_secs(1)).await;
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
  None
}



pub struct AlbumMetadata {
  pub cover_url: String,
  pub first_release_date: String,
  pub musicbrainz_id: String,
  pub wikidata_id: Option<String>,
  pub primary_type: String,
}
  
impl Default for AlbumMetadata {
  fn default() -> Self {
    Self {
      cover_url: String::from(""),
      first_release_date: String::from(""),
      musicbrainz_id: String::from(""),
      wikidata_id: None,
      primary_type: String::from(""),
    }
  }
}

async fn fetch_musicbrainz_metadata(
    client: &Client,
    url: &str,
    cover_art_already_downloaded: bool,
    album_id: &str,
) -> Result<AlbumMetadata, Box<dyn std::error::Error>> {
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

        let cover_url = if !cover_art_already_downloaded {
            let cover_art_url = if is_release_group {
                format!("http://coverartarchive.org/release-group/{}", id)
            } else {
                format!("http://coverartarchive.org/release/{}", id)
            };

            sleep(Duration::from_secs(1)).await;

            let cover_art_response = client.get(&cover_art_url).send().await?;
            let cover_art_body = if cover_art_response.status().is_success() {
                cover_art_response.text().await?
            } else {
                "".to_string()
            };
            let cover_art: serde_json::Value = serde_json::from_str(&cover_art_body)?;
            let images = cover_art["images"].as_array().unwrap_or(&empty_vec);
            let first_image = images.get(0).unwrap_or(&serde_json::Value::Null).clone();
            first_image["image"].as_str().unwrap_or("").to_string()
        } else {
            let cover_art_path = get_icon_art_path();
            let cover_url_path = cover_art_path.join(format!("{}.jpg", album_id));
            cover_url_path.to_str().map(|s| s.to_owned()).unwrap_or_else(|| "".to_string())
        };

        let release_url = if is_release_group {
            format!(
                "https://musicbrainz.org/ws/2/release-group/{}?inc=aliases+artist-credits+releases+url-rels&fmt=json",
                id
            )
        } else {
            format!(
                "https://musicbrainz.org/ws/2/release/{}?inc=aliases+artist-credits+releases+url-rels&fmt=json",
                id
            )
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

        let wikidata_id = release["relations"]
            .as_array()
            .and_then(|relations| {
                relations.iter().find_map(|relation| {
                    if relation["type"].as_str() == Some("wikidata") {
                        relation["url"]["resource"]
                            .as_str()
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
  let cover_art_path = get_cover_art_path();
  let cover_url_path = cover_art_path.join(format!("{}.jpg", album_id));
  let cover_url_file_path = cover_url_path.to_str().map(|s| s.to_owned()).unwrap();

  if cover_url_path.exists() {
      // warn!("Cover art already downloaded for album: {}", album_id);
      let absolute_path = fs::canonicalize(&cover_url_file_path).await?;
      let clean_path = absolute_path.to_str().ok_or_else(|| {
          let error_message = "Path conversion error";
          warn!("{}", error_message);
          io::Error::new(io::ErrorKind::Other, error_message)
      })?;
      return Ok(clean_path.to_string());
  }

  if image_url.is_empty() {
      warn!("Image URL is empty for album: {}", album_id);
      return Err(io::Error::new(io::ErrorKind::Other, "Image URL is empty"));
  }

  let _ = reqwest::Url::parse(image_url).map_err(|e| {
      warn!("Invalid URL: {}, error: {}", image_url, e);
      io::Error::new(io::ErrorKind::Other, e)
  })?;

  let image_response = client.get(image_url).send().await.map_err(|e| {
      warn!("Failed to send GET request to image URL: {}", e);
      io::Error::new(io::ErrorKind::Other, e)
  })?;

  let image_bytes = image_response.bytes().await.map_err(|e| {
      warn!("Failed to read response body as bytes: {}", e);
      io::Error::new(io::ErrorKind::Other, e)
  })?;

  fs::write(&cover_url_file_path, image_bytes).await.map_err(|e| {
      warn!("Failed to write image bytes to file: {}", e);
      e
  })?;

  let absolute_path = fs::canonicalize(&cover_url_file_path).await.map_err(|e| {
      warn!("Failed to get absolute path of image file: {}", e);
      e
  })?;

  let absolute_path_str = absolute_path.to_str().ok_or_else(|| {
      let error_message = "Path conversion error";
      warn!("{}", error_message);
      io::Error::new(io::ErrorKind::Other, error_message)
  })?;

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
  let re = Regex::new(r"(?i)\b.*cd.*\b").unwrap();
  let album_name = album.name.to_lowercase();
  let album_name = re.replace_all(&album_name, "").trim().to_string();

  let metadata = fetch_album_metadata(client, &artist_name, &album_name, album.id.to_string()).await;

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
    let log = format!("Cover art already found for Album: {}", album.name);
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