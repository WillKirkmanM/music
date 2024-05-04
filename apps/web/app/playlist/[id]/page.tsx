import prisma from "@/prisma/prisma";
import { Playlist, Song as SSong, User } from "@prisma/client";
import { redirect } from "next/navigation";
import Image from "next/image";
import art from "@/public/music_with_cover_art.json";
import Artist from "@/types/Music/Artist";
import Song from "@/types/Music/Song";
import Album from "@/types/Music/Album";
import BigCard from "@/components/Music/Card/BigCard";
import imageToBase64 from "@/lib/Image/imageToBase64";
import PlaylistTable from "@/components/Music/Playlist/PlaylistTable";
import { Avatar, AvatarFallback, AvatarImage } from "@music/ui/components/avatar";
import { Users } from "lucide-react";

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

  let songIds = playlist.songs.map((song) => song.id);

  let songsWithMetadata = flattenedLibrary.filter((librarySong) =>
    songIds.includes(librarySong.song.id.toString())
  );

  return (
    <>
      <div className="flex flex-row items-center justify-center space-x-5 m-10">
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
        </div>
      </div>
      <PlaylistTable songsWithMetadata={songsWithMetadata} />
    </>
);
}