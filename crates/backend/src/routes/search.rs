use std::collections::HashSet;
use std::error::Error;
use std::sync::{Arc, Mutex};

use actix_web::{delete, get, post, web, HttpResponse, Responder};
use chrono::NaiveDateTime;
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
use meilisearch_sdk::client::Client;
use meilisearch_sdk::settings::{Settings, TypoToleranceSettings};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::routes::album::fetch_album_info;
use crate::routes::artist::fetch_artist_info;
use crate::routes::song::fetch_song_info;
use crate::structures::structures::Artist;
use crate::utils::config::get_config;
use crate::utils::database::database::establish_connection;
use crate::utils::database::models::{NewSearchItem, SearchItem};

#[derive(Serialize, Deserialize, Clone)]
pub struct CombinedItem {
    pub item_type: String,
    pub name: String,
    pub id: String,
    pub description: Option<String>,
    pub acronym: String,
    pub generated_id: Uuid,
}

fn extract_acronym(name: &str) -> String {
    let acronym: String = name.split_whitespace()
        .map(|word| {
            if word == "&" {
                'A'
            } else {
                word.chars().next().unwrap_or_default().to_uppercase().next().unwrap_or_default()
            }
        })
        .collect();

    if acronym.len() > 1 {
        acronym
    } else {
        String::new()
    }
}

pub async fn populate_search_data() -> Result<Vec<CombinedItem>, Box<dyn std::error::Error>> {
    let config = get_config().await?;
    let library: Vec<Artist> = serde_json::from_str(&config)?;

    let generated_ids = Arc::new(Mutex::new(HashSet::new()));

    let unique_uuid = |generated_ids: &Arc<Mutex<HashSet<Uuid>>>| -> Uuid {
        let mut id;
        loop {
            id = Uuid::new_v4();
            let mut ids = generated_ids.lock().unwrap();
            if !ids.contains(&id) {
                ids.insert(id);
                break;
            }
        }
        id
    };

    let client = Client::new("http://127.0.0.1:7700", None::<&str>)?;
    let index = client.index("library");

    index.delete_all_documents().await?;

    let mut combined_items = Vec::new();

    for artist in library {
        let artist_id = unique_uuid(&generated_ids);
        combined_items.push(CombinedItem {
            item_type: "artist".to_string(),
            name: artist.name.clone(),
            id: artist.id.clone(),
            description: Some(artist.description),
            acronym: extract_acronym(&artist.name),
            generated_id: artist_id,
        });

        for album in &artist.albums {
            let album_id = unique_uuid(&generated_ids);
            combined_items.push(CombinedItem {
                item_type: "album".to_string(),
                name: album.name.clone(),
                id: album.id.clone(),
                description: Some(album.description.clone()),
                acronym: extract_acronym(&album.name),
                generated_id: album_id,
            });

            for song in &album.songs {
                let song_id = unique_uuid(&generated_ids);
                combined_items.push(CombinedItem {
                    item_type: "song".to_string(),
                    name: song.name.clone(),
                    id: song.id.clone(),
                    description: None,
                    acronym: extract_acronym(&song.name),
                    generated_id: song_id,
                });
            }
        }
    }

    index.add_documents(&combined_items, Some("generated_id")).await?;

    Ok(combined_items)
}

#[get("/populate")]
async fn populate_search() -> HttpResponse {
    match populate_search_data().await {
        Ok(combined_items) => HttpResponse::Ok().json(combined_items),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[derive(Serialize, Deserialize)]
struct SearchQuery {
    q: String,
}

#[derive(Serialize, Deserialize)]
struct ArtistInfo {
    id: String,
    name: String,
    icon_url: String,
    followers: u64,
    description: String,
}

#[derive(Serialize, Deserialize)]
struct AlbumInfo {
    id: String,
    name: String,
    cover_url: String,
    first_release_date: String,
    description: String,
}

#[derive(Serialize, Deserialize)]
struct SongInfo {
    id: String,
    name: String,
    duration: f64,
}

#[derive(Serialize, Deserialize)]
struct ResponseCombinedItem {
    item_type: String,
    name: String,
    id: String,
    description: Option<String>,
    acronym: String,
    artist_object: Option<ArtistInfo>,
    album_object: Option<AlbumInfo>,
    song_object: Option<SongInfo>,
}

#[get("/library")]
async fn search_fn(query: web::Query<SearchQuery>) -> HttpResponse {
    let client = Client::new("http://localhost:7700", None::<&str>).unwrap();
    let index = client.index("library");

    // Set sortable attributes
    let settings = Settings::new().with_sortable_attributes(&["name"]);
    if let Err(e) = index.set_settings(&settings).await {
        return HttpResponse::InternalServerError().body(format!("Failed to set settings: {:?}", e));
    }

    let typo_tolerance = TypoToleranceSettings {
        enabled: Some(true),
        disable_on_attributes: None,
        disable_on_words: None,
        min_word_size_for_typos: None,
    };

    if let Err(e) = index.set_typo_tolerance(&typo_tolerance).await {
        return HttpResponse::InternalServerError().body(format!("Failed to set typo tolerance: {:?}", e));
    }

    match index.search()
        .with_query(&query.q)
        .with_sort(&["name:asc"])
        .execute::<CombinedItem>()
        .await
    {
        Ok(search_results) => {
            let hits_futures: Vec<_> = search_results.hits.into_iter().map(|result| {
                async move {
                    let song_object = if result.result.item_type == "song" {
                        fetch_song_info(result.result.id.clone()).await.ok()
                    } else {
                        None
                    };
                    let album_object = if result.result.item_type == "album" {
                        fetch_album_info(result.result.id.clone()).await.ok()
                    } else {
                        None
                    };
                    let artist_object = if result.result.item_type == "artist" {
                        fetch_artist_info(result.result.id.clone()).await.ok()
                    } else {
                        None
                    };
                    
                    ResponseCombinedItem {
                        item_type: result.result.item_type.clone(),
                        name: result.result.name,
                        id: result.result.id,
                        description: result.result.description,
                        acronym: result.result.acronym,
                        artist_object: if result.result.item_type == "song" {
                            song_object.as_ref().map(|song| ArtistInfo {
                                id: song.artist_object.id.clone(),
                                name: song.artist_object.name.clone(),
                                icon_url: song.artist_object.icon_url.clone(),
                                followers: song.artist_object.followers,
                                description: song.artist_object.description.clone(),
                            })
                        } else if result.result.item_type == "album" {
                            album_object.as_ref().map(|album| ArtistInfo {
                                id: album.artist_object.id.clone(),
                                name: album.artist_object.name.clone(),
                                icon_url: album.artist_object.icon_url.clone(),
                                followers: album.artist_object.followers,
                                description: album.artist_object.description.clone(),
                            })
                        } else if result.result.item_type == "artist" {
                            artist_object.as_ref().map(|artist| ArtistInfo {
                                id: artist.id.clone(),
                                name: artist.name.clone(),
                                icon_url: artist.icon_url.clone(),
                                followers: artist.followers,
                                description: artist.description.clone(),
                            })
                        } else {
                            None
                        },
                        album_object: if result.result.item_type == "song" {
                            song_object.as_ref().map(|song| AlbumInfo {
                                id: song.album_object.id.clone(),
                                name: song.album_object.name.clone(),
                                cover_url: song.album_object.cover_url.clone(),
                                first_release_date: song.album_object.first_release_date.clone(),
                                description: song.album_object.description.clone(),
                            })
                        } else {
                            album_object.as_ref().map(|album| AlbumInfo {
                                id: album.id.clone(),
                                name: album.name.clone(),
                                cover_url: album.cover_url.clone(),
                                first_release_date: album.first_release_date.clone(),
                                description: album.description.clone(),
                            })
                        },
                        song_object: song_object.as_ref().map(|song| SongInfo {
                            id: song.id.clone(),
                            name: song.name.clone(),
                            duration: song.duration,
                        }),
                    }
                }
            }).collect();

            let hits: Vec<ResponseCombinedItem> = futures::future::join_all(hits_futures).await;

            HttpResponse::Ok().json(hits)
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Search failed: {:?}", e)),
    }
}

#[derive(Deserialize)]
struct AddSearchHistoryRequest {
    user_id: i32,
    search: String,
}

#[derive(Deserialize)]
struct DeleteItemFromSearchHistoryRequest {
    id: i32,
}

#[derive(Deserialize)]
struct GetLastSearchedQueriesRequest {
    user_id: i32,
}

#[derive(Serialize)]
struct SearchItemResponse {
    id: i32,
    user_id: i32,
    search: String,
    created_at: NaiveDateTime,
}

#[post("/add_search_history")]
async fn add_search_history(item: web::Json<AddSearchHistoryRequest>) -> Result<impl Responder, Box<dyn Error>> {
    use crate::utils::database::schema::search_item::dsl::*;

    let mut connection = establish_connection().get().unwrap();

    let new_search_item = NewSearchItem {
        user_id: item.user_id,
        search: item.search.clone(),
    };

    diesel::insert_into(search_item)
        .values(&new_search_item)
        .execute(&mut connection)?;

    Ok(HttpResponse::Ok().body("Search history added successfully"))
}

#[delete("/delete_item_from_search_history")]
async fn delete_item_from_search_history(item: web::Json<DeleteItemFromSearchHistoryRequest>) -> Result<impl Responder, Box<dyn Error>> {
    use crate::utils::database::schema::search_item::dsl::*;

    let mut connection = establish_connection().get().unwrap();

    diesel::delete(search_item.filter(id.eq(item.id)))
        .execute(&mut connection)?;

    Ok(HttpResponse::Ok().body("Search history item deleted successfully"))
}

#[get("/get_last_searched_queries")]
async fn get_last_searched_queries(query: web::Query<GetLastSearchedQueriesRequest>) -> Result<impl Responder, Box<dyn Error>> {
    use crate::utils::database::schema::search_item::dsl::*;

    let mut connection = establish_connection().get().unwrap();

    let results = search_item
        .filter(user_id.eq(query.user_id))
        .order(created_at.desc())
        .limit(10)
        .load::<SearchItem>(&mut connection)?;

    let response: Vec<SearchItemResponse> = results.into_iter().map(|item| SearchItemResponse {
        id: item.id,
        user_id: item.user_id,
        search: item.search,
        created_at: item.created_at,
    }).collect();

    Ok(HttpResponse::Ok().json(response))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/search")
            .service(search_fn)
            .service(add_search_history)
            .service(delete_item_from_search_history)
            .service(get_last_searched_queries)
            .service(populate_search)
    );
}