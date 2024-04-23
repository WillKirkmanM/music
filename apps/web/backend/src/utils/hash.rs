use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub fn hash_song(name: &String, artist: &String, track_number: u16) -> u64 {
  let mut hasher = DefaultHasher::new();

  (name.to_owned() + artist + track_number.to_string().as_str()).hash(&mut hasher);
  hasher.finish()
}

pub fn hash_album(name: &String, artist: &String) -> u64 {
  let mut hasher = DefaultHasher::new();

  (name.to_owned() + artist).hash(&mut hasher);
  hasher.finish()
}


