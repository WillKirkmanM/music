use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Song {
    pub name: String,
    pub artist: String,
    pub contributing_artists: Vec<String>,
    pub track_number: u16,
    pub path: String,
}

#[derive(Serialize, Deserialize)]
pub struct Library {
    pub albums: Vec<Album>,
}

#[derive(Serialize, Deserialize)]
pub struct Album {
    pub name: String,
    pub artist: String,
    pub songs: Vec<Song>,
}