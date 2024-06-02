import MiniSearch from "minisearch";
import path from "path"
import fs from "fs"

import type { Library } from "@/types/Music/Library";
import type Artist from "@/types/Music/Artist";
import type Album from "@/types/Music/Album";
import type Song from "@/types/Music/Song";
import getConfig from "@/actions/Config/getConfig";
import { randomUUID } from "crypto";

export async function populateSearch() {
  const config = await getConfig()
  if (!config) return;
  const library: Library = JSON.parse(config);

  if (Object.keys(library).length !== 0) {

  let generatedIDs = new Set();

  function uniqueUUID() {
    let id;
    do {
      id = randomUUID();
    } while (generatedIDs.has(id));
    generatedIDs.add(id);
    return id;
  }

  const flattenedArtists = library.map((artist: Artist) => ({
    type: 'Artist',
    name: artist.name,
    id: artist.id,
    artist: artist,
    generatedID: uniqueUUID()
  }));

  const flattenedAlbums = library.flatMap((artist: Artist) =>
    artist.albums.map((album: Album) => ({
      type: 'Album',
      name: album.name,
      id: album.id,
      artist: artist,
      album: album,
      generatedID: uniqueUUID()
    }))
  );

  const flattenedSongs = library.flatMap((artist: Artist) =>
    artist.albums.flatMap((album: Album) =>
      album.songs.map((song: Song) => ({
        type: 'Song',
        name: song.name,
        id: song.id,
        album: album,
        artist: album,
        song: song,
        generatedID: uniqueUUID()
      }))
    )
  );

  const miniSearch = new MiniSearch({
    fields: ['type', 'name', 'id', 'generatedID'],
    storeFields: ['type', 'name', 'id', 'artist', 'album', 'song'],
    idField: 'generatedID',
    searchOptions: {
      fuzzy: 0.3
    }
  });

    await miniSearch.addAllAsync(flattenedArtists);
    await miniSearch.addAllAsync(flattenedAlbums);
    await miniSearch.addAllAsync(flattenedSongs);

    
    return miniSearch;
  }
}

export const miniSearch = populateSearch();