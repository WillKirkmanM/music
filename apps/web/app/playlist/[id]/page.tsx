import prisma from "@/prisma/prisma"
import { Playlist, Song as SSong } from "@prisma/client"
import { redirect } from "next/navigation"
import Image from "next/image"
import art from "@/public/music_with_cover_art.json"
import Artist from "@/types/Music/Artist"
import Song from "@/types/Music/Song"
import Album from "@/types/Music/Album"

type PlaylistPageParams = {
  params: {
    id: string
  }
}

export default async function UsernamePage({ params }: PlaylistPageParams) {
  let playlist = (await prisma.playlist.findFirst({
    where: {
      id: params.id,
    },
    include: {
      songs: true
    }
  })) as Playlist & { songs: SSong[] };

  // Flatten the library
  const flattenedLibrary = art.flatMap((artist: Artist) =>
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

  let songIds = playlist.songs.map(song => song.id);

  let songsWithMetadata = flattenedLibrary.filter(librarySong => 
    songIds.includes(librarySong.song.id.toString())
  );

return (
  <div className="flex items-center justify-center h-screen">
    <div>
      <h1 className="text-lg">{playlist.name}</h1>
      {songsWithMetadata.map(song => (
          <li key={song.song.id}>
            <p>Song Name: {song.songName}</p>
            <p>Artist: {song.artistName}</p>
            <p>Track Number: {song.trackNumber}</p>
          </li>
      ))}
    </div>
  </div>
);
}