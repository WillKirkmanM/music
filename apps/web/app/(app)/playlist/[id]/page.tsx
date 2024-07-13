import prisma from "@/prisma/prisma";
import { Playlist, Song as SSong, User } from "@prisma/client";
import Song from "@/types/Music/Song";
import PlaylistTable from "@/components/Music/Playlist/PlaylistTable";
import { Avatar, AvatarFallback } from "@music/ui/components/avatar";
import DeletePlaylistButton from "@/components/Music/Playlist/DeletePlaylistButton";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import Album from "@/types/Music/Album";
import Artist from "@/types/Music/Artist";

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
  })) as Playlist & { songs: Song[], users: User[] };

  let songIds = playlist.songs.map((song) => song.id);

  const serverIPAddress = await getServerIpAddress();
  const port = await GetPort();

  let songsWithMetadataPromises = songIds.map(async (songID) => {
    const response = await fetch(`http://${serverIPAddress}:${port}/server/song/info/${songID}`);
    const data: Song & { artist_object: Artist; album_object: Album } = await response.json();
    return data;
  });
  
  let songsWithMetadata: (Song & { artist_object: Artist; album_object: Album })[] = await Promise.all(songsWithMetadataPromises);
  
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
  
  let totalDuration = songsWithMetadata.reduce((total, song) => total + song.duration, 0)

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