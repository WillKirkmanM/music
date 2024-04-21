import MiniSearch from "minisearch";
import music from "@/public/music_with_cover_art.json";

import type { Library } from "@/types/Music/Library";
import type Artist from "@/types/Music/Artist";
import type Album from "@/types/Music/Album";
import type Song from "@/types/Music/Song";

export async function populateSearch() {
  const library: Library = music;

  // Library has nested data. Search wants linear data.  
  const flattenedLibrary = library.flatMap((artist: Artist) =>
    artist.albums.flatMap((album: Album) =>
      album.songs.map((song: Song) => ({
        artistName: artist.name,
        coverURL: album.cover_url,
        albumName: album.name,
        songName: song.name,
        contributingArtists: song.contributing_artists.join(", "),
        trackNumber: song.track_number,
        path: song.path,
        song: song,
      }))
    )
  );

  const miniSearch = new MiniSearch({ 
    fields: ["artistName", "albumName", "songName", "contributingArtists", "trackNumber", "path", "coverURL", "song"],
    storeFields: ["artistName", "albumName", "songName", "coverURL", "song"],
    idField: "path",
  });

  await miniSearch.addAllAsync(flattenedLibrary);

  return miniSearch;
}

export const miniSearch = populateSearch();