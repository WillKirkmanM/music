use regex::Regex;

pub fn format_contributing_artists(artists: Vec<String>) -> Vec<(String, Vec<String>)> {
  let re = Regex::new(r"(?i)(&|featuring|ft|with|feat\.?|and|presents|\u{0000}|,|vs\.?|x)").unwrap();

  let mut formatted_artists = Vec::new();

  for artist in artists {
    let split_artists: Vec<String> = if re.is_match(&artist) {
      re.split(&artist)
        .map(|s| s.trim().to_string())
        .collect()
    } else {
      artist.split(',')
        .map(|s| s.trim().to_string())
        .collect()
    };

    if let Some((main_artist, contributing_artists)) = split_artists.split_first() {
      formatted_artists.push((main_artist.to_string(), contributing_artists.to_vec()));
    }
  }

  formatted_artists
}