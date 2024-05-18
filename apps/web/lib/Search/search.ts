import MiniSearch from "minisearch";
import path from "path"
import fs from "fs"

import type { Library } from "@/types/Music/Library";
import type Artist from "@/types/Music/Artist";
import type Album from "@/types/Music/Album";
import type Song from "@/types/Music/Song";
import getConfig from "@/actions/Config/getConfig";

export async function populateSearch() {
  const config = await getConfig()
  if (!config) return;
  const library: Library = JSON.parse(config);

  if (Object.keys(library).length !== 0) {
      // Library has nested data. Search wants linear data.  
      const flattenedLibrary = library.flatMap((artist: Artist) =>
        artist.albums.flatMap((album: Album) =>
        album.songs.map((song: Song) => ({
          artist: artist,
          album: album,
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
      fields: ["artist", "albumName", "songName", "contributingArtists", "trackNumber", "path", "coverURL", "song"],
      storeFields: ["artist", "album", "albumName", "songName", "coverURL", "song"],
      idField: "path",
      searchOptions: {
        fuzzy: 0.3
      }
    });
    
    await miniSearch.addAllAsync(flattenedLibrary);
    
    return miniSearch;
  }
}

export const miniSearch = populateSearch();