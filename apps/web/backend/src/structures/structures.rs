use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Album {
    pub id: u64,
    pub name: String,
    pub cover_url: String,
    pub songs: Vec<Song>,
    pub first_release_date: String,
    pub musicbrainz_id: String,
    pub wikidata_id: Option<String>,
    pub primary_type: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Artist {
    pub id: u64,
    pub name: String,
    pub icon_url: String,
    pub followers: u64,
    pub albums: Vec<Album>,
    pub description: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Song {
    pub id: u64,
    pub name: String,
    pub artist: String,
    pub contributing_artists: Vec<String>,
    pub track_number: u16,
    pub path: String,
    pub duration: f64,
}