use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Album {
    pub id: String,
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
    pub id: String,
    pub name: String,
    pub icon_url: String,
    pub followers: u64,
    pub albums: Vec<Album>,
    pub description: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Song {
    pub id: String,
    pub name: String,
    pub artist: String,
    pub contributing_artists: Vec<String>,
    pub track_number: u16,
    pub path: String,
    pub duration: f64,
}


// Album Section


#[derive(Serialize, Deserialize, Clone)]
pub struct ReleaseGroupAlbum {
    pub rating: Rating,
    pub artist_credit: Vec<CreditArtist>,
    pub relationships: Vec<Relationship>,
    pub releases: Vec<Information>,
    pub musicbrainz_id: String,
    pub first_release_date: String,
    pub title: String,
    pub aliases: Vec<Alias>,
    pub primary_type_id: String,
    pub annotation: String
}

impl Default for ReleaseGroupAlbum {
    fn default() -> Self {
        ReleaseGroupAlbum {
            rating: Rating::default(),
            artist_credit: Vec::new(),
            relationships: Vec::new(),
            releases: Vec::new(),
            musicbrainz_id: String::new(),
            first_release_date: String::new(),
            title: String::new(),
            aliases: Vec::new(),
            primary_type_id: String::new(),
            annotation: String::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ReleaseAlbum {
    pub information: Information,
    pub tracks: Vec<Track>,
    pub labels: Vec<Label>,
    pub purchase_relationships: Vec<Relationship>
}

impl Default for ReleaseAlbum {
    fn default() -> Self {
        ReleaseAlbum {
            information: Information::default(),
            tracks: Vec::new(),
            labels: Vec::new(),
            purchase_relationships: Vec::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Information {
    pub date: String,
    pub country: String,
    pub status_id: String,
    pub title: String,
    pub barcode: String,
    pub quality: String,
    pub packaging: String,
    pub disambiguation: String,
    pub release_type: String,
    pub asin: String,
    pub music_brainz_id: String,
    pub packaging_id: String,
    pub status: String,
    pub tags: Vec<Tag>,
    pub genres: Vec<Genre>,
    pub cover_art_status: CoverArtStatus,
    pub collections: Vec<Collection>,
    pub artist_credits: Vec<CreditArtist>
}

impl Default for Information {
    fn default() -> Self {
        Information {
            date: String::new(),
            country: String::new(),
            status_id: String::new(),
            title: String::new(),
            barcode: String::new(),
            quality: String::new(),
            packaging: String::new(),
            disambiguation: String::new(),
            release_type: String::new(),
            asin: String::new(),
            music_brainz_id: String::new(),
            packaging_id: String::new(),
            status: String::new(),
            tags: Vec::new(),
            genres: Vec::new(),
            cover_art_status: CoverArtStatus::default(),
            collections: Vec::new(),
            artist_credits: Vec::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TextRepresentation {
    pub script: String,
    pub language: String
}

impl Default for TextRepresentation {
    fn default() -> Self {
        TextRepresentation {
            script: String::new(),
            language: String::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CoverArtStatus {
    pub count: u16,
    pub front: String,
    pub darkened: String,
    pub artwork: String,
    pub back: String
}

impl Default for CoverArtStatus {
    fn default() -> Self {
        CoverArtStatus {
            count: 0,
            front: String::new(),
            darkened: String::new(),
            artwork: String::new(),
            back: String::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CreditArtist {
    pub name: String,
    pub join_phrase: String,
    pub musicbrainz_id: String,
    pub artist_type: String,
    pub disambiguation: String,
    pub genres: Vec<Genre>,
    pub aliases: Vec<Alias>
}

impl Default for CreditArtist {
    fn default() -> Self {
        CreditArtist {
            name: String::new(),
            join_phrase: String::new(),
            musicbrainz_id: String::new(),
            artist_type: String::new(),
            disambiguation: String::new(),
            genres: Vec::new(),
            aliases: Vec::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Genre {
    pub musicbrainz_id: String,
    pub disambiguation: String,
    pub name: String,
    pub count: u64
}

impl Default for Genre {
    fn default() -> Self {
        Genre {
            musicbrainz_id: String::new(),
            disambiguation: String::new(),
            name: String::new(),
            count: 0,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Alias {
    pub begin: String,
    pub alias_type: String,
    pub sort_name: String,
    pub name: String,
    pub end: String,
    pub locale: String,
    pub ended: bool,
    pub type_id: String,
    pub primary: String
}

impl Default for Alias {
    fn default() -> Self {
        Alias {
            begin: String::new(),
            alias_type: String::new(),
            sort_name: String::new(),
            name: String::new(),
            end: String::new(),
            locale: String::new(),
            ended: false,
            type_id: String::new(),
            primary: String::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Collection {
    pub entity_type: String,
    pub type_id: String,
    pub name: String,
    pub editor: String,
    pub release_count: u64,
    pub id: String,
    pub collection_type: String
}

impl Default for Collection {
    fn default() -> Self {
        Collection {
            entity_type: String::new(),
            type_id: String::new(),
            name: String::new(),
            editor: String::new(),
            release_count: 0,
            id: String::new(),
            collection_type: String::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Track {
    pub length: u64,
    pub artist_credit: Vec<Artist>,
    pub track_name: String,
    pub position: u16,
    pub video: bool,
    pub first_release_date: String,
    pub number: String,
    pub musicbrainz_id: String,
    pub rating: Rating,
    pub tags: Vec<Tag>
}


#[derive(Serialize, Deserialize, Clone)]
pub struct Rating {
    pub votes_count: u64,
    pub value: u8
}

impl Default for Rating {
    fn default() -> Self {
        Rating {
            votes_count: 0,
            value: 0,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Tag {
    pub count: u64,
    pub name: String
}

impl Default for Tag {
    fn default() -> Self {
        Tag {
            count: 0,
            name: String::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Label {
    pub catalog_number: String,
    pub type_id: String,
    pub name: String,
    pub sort_name: String,
    pub label_type: String,
    pub id: String,
    pub tags: Vec<Tag>,
    pub genre: Vec<Genre>,
    pub aliases: Vec<Alias>
}

impl Default for Label {
    fn default() -> Self {
        Label {
            catalog_number: String::new(),
            type_id: String::new(),
            name: String::new(),
            sort_name: String::new(),
            label_type: String::new(),
            id: String::new(),
            tags: Vec::new(),
            genre: Vec::new(),
            aliases: Vec::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Relationship {
    pub direction: String,
    pub type_id: String,
    pub ended: bool,
    pub begin: String,
    pub purchase_relationship_type: String,
    pub musicbrainz_id: String,
    pub target_credit: String,
    pub source_credit: String,
    pub target_type: String,
    pub end: String,
    pub url: String,
}

impl Default for Relationship {
    fn default() -> Self {
        Relationship {
            direction: String::new(),
            type_id: String::new(),
            ended: false,
            begin: String::new(),
            purchase_relationship_type: String::new(),
            musicbrainz_id: String::new(),
            target_credit: String::new(),
            source_credit: String::new(),
            target_type: String::new(),
            end: String::new(),
            url: String::new(),
        }
    }
}
