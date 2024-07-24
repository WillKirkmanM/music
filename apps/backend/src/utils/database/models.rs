use diesel::prelude::*;
use super::schema::{user, search_item, listen_history_item, follow, playlist, song, _playlist_to_user, _playlist_to_song, account, session};
use chrono::NaiveDateTime;

#[derive(Insertable, Queryable, Selectable, Debug)]
#[diesel(table_name = user)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct User {
    pub id: i32,
    pub name: Option<String>,
    pub username: String,
    pub password: String,
    pub image: Option<String>,
    pub bitrate: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub now_playing: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = user)]
pub struct NewUser {
    pub username: String,
    pub password: String,
}

#[derive(Insertable, Queryable, Associations, Identifiable, Debug)]
#[diesel(table_name = search_item)]
#[diesel(belongs_to(User, foreign_key = user_id))]
pub struct SearchItem {
    pub id: String,
    pub user_id: i32,
    pub search: String,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Queryable, Associations, Identifiable, Debug)]
#[diesel(table_name = listen_history_item)]
#[diesel(belongs_to(User, foreign_key = user_id))]
#[diesel(belongs_to(Song, foreign_key = song_id))]
pub struct ListenHistoryItem {
    pub id: String,
    pub user_id: i32,
    pub song_id: String,
    pub listened_at: NaiveDateTime,
}

#[derive(Insertable, Queryable, Identifiable, Debug)]
#[diesel(table_name = follow)]
pub struct Follow {
    pub id: String,
    pub follower_id: String,
    pub following_id: String,
}

#[derive(Insertable, Queryable, Identifiable, Debug)]
#[diesel(table_name = playlist)]
pub struct Playlist {
    pub id: String,
    pub name: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Queryable, Identifiable, Debug)]
#[diesel(table_name = song)]
pub struct Song {
    pub id: String,
}

#[derive(Insertable, Queryable, Associations, Debug)]
#[diesel(table_name = _playlist_to_user)]
#[diesel(belongs_to(Playlist, foreign_key = a))]
#[diesel(belongs_to(User, foreign_key = b))]
pub struct PlaylistToUser {
    pub a: String,
    pub b: i32,
}

#[derive(Insertable, Queryable, Associations, Debug)]
#[diesel(table_name = _playlist_to_song)]
#[diesel(belongs_to(Playlist, foreign_key = a))]
#[diesel(belongs_to(Song, foreign_key = b))]
pub struct PlaylistToSong {
    pub a: String,
    pub b: String,
}

#[derive(Insertable, Queryable, Associations, Identifiable, Debug)]
#[diesel(table_name = account)]
#[diesel(belongs_to(User, foreign_key = user_id))]
pub struct Account {
    pub id: String,
    pub user_id: i32,
    pub provider_type: String,
    pub provider_id: String,
    pub provider_account_id: String,
    pub refresh_token: Option<String>,
    pub access_token: Option<String>,
    pub access_token_expires: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Queryable, Associations, Identifiable, Debug)]
#[diesel(table_name = session)]
#[diesel(belongs_to(User, foreign_key = user_id))] 
pub struct Session {
    pub id: String,
    pub user_id: i32,
    pub expires: NaiveDateTime,
    pub session_token: String,
    pub access_token: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}