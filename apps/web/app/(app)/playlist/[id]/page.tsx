import prisma from "@/prisma/prisma";
import { Playlist, Song as SSong, User } from "@prisma/client";
import Artist from "@/types/Music/Artist";
import Song from "@/types/Music/Song";
import Album from "@/types/Music/Album";
import PlaylistTable from "@/components/Music/Playlist/PlaylistTable";
import { Avatar, AvatarFallback } from "@music/ui/components/avatar";
import DeletePlaylistButton from "@/components/Music/Playlist/DeletePlaylistButton";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import path from "path"
import fs from "fs"
import { Library } from "@/types/Music/Library";
import getConfig from "@/actions/Config/getConfig";

type PlaylistPageParams = {
  params: {
    id: string;
  };
};

export default async function PlaylistPage({ params }: PlaylistPageParams) {
  let playlist = (await prisma.playlist.findFirst({
    where: {
      id: params.id,
    },
    include: {
      songs: true,
      users: true
    },
  })) as Playlist & { songs: SSong[], users: User[] };

  const config = await getConfig()
  if (!config) return <p>No Library</p>;
  const art: Library = JSON.parse(config);

  if (Object.keys(art).length === 0) {
    return (
      <p>No Data Available</p>
    )
  }

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
        album: album,
        artist: artist
      }))
    )
  );

  let songIds = playlist.songs.map((song) => song.id);

  let songsWithMetadata = flattenedLibrary.filter((librarySong) => songIds.includes(librarySong.song.id.toString()))
  
  function formatDuration(duration: number) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.round(duration % 60);

    let result = '';
    if (hours > 0) {
      result += `${hours} Hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      result += `${minutes} Minute${minutes > 1 ? 's' : ''} `;
    }
    if (seconds > 0) {
      result += `${seconds} Second${seconds > 1 ? 's' : ''}`;
    }
    return result.trim();
  }
  
  let totalDuration = songsWithMetadata.reduce((total, song) => total + song.song.duration, 0)


  return (
    <ScrollArea className="h-full overflow-x-hidden overflow-y-auto pt-20">
      <div className="flex flex-row items-start justify-between space-x-5 m-10">
        <div className="flex items-center justify-center space-x-5 flex-grow">
          <div>
            <Avatar className="w-24 h-24 text-4xl">
              <AvatarFallback>{playlist.users[0]?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <h1 className="text-3xl">{playlist.name}</h1>
            {playlist.users.map(user => {
              return <h1 key={user.id} className="text-2xl">Created by {user.username}</h1>
            })}
          {formatDuration(totalDuration)}
          </div>
        </div>
        <div className="flex items-start">
          <DeletePlaylistButton playlistID={params.id} />
        </div>
      </div>
      <PlaylistTable songsWithMetadata={songsWithMetadata} />
      <ScrollBar />
    </ScrollArea>
  );
}