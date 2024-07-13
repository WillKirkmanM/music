import BigCard from "../Music/Card/BigCard";
import fs from "fs";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import type { Library } from "@/types/Music/Library";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import { unstable_cache as cache } from "next/cache";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import prisma from "@/prisma/prisma";
import Song from "@/types/Music/Song";
import Album from "@/types/Music/Album";
import Artist from "@/types/Music/Artist";

export const revalidate = 3600

async function getSongsFromYourLibrary() {
  const session = await getServerSession();
  const username = session?.user.username;
  const songsFromAllPlaylists = await prisma.playlist.findMany({
    where: {
      users: {
        some: {
          username
        }
      }
    },
    select: {
      songs: {
        select: {
          id: true,
        }
      }
    },
    take: 10,
  });

  const playlistSongIDs = songsFromAllPlaylists.flatMap(playlist => playlist.songs.map(song => song.id));

  const serverIPAddress = await getServerIpAddress();
  const port = await GetPort();
  const detailedSongsPromises = playlistSongIDs.map(async (songId) => {
    const songRequest = await fetch(`http://${serverIPAddress}:${port}/server/song/info/${songId}`);
    const detailedSong = await songRequest.json();
    return detailedSong;
  });

  const detailedSongs = await Promise.all(detailedSongsPromises);

  return detailedSongs;
}

// const getCachedSongsFromYourLibrary = cache(
//   async () => await getSongsFromYourLibrary(),
//   ['from-your-library'],
//   { revalidate: 300, tags: ["from-your-library"] }
// );


export default async function FromYourLibrary() {
  // let librarySongs = await getCachedSongsFromYourLibrary()
  let librarySongs = await getSongsFromYourLibrary()

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  return librarySongs.length > 0 && (
    <>
      <h1 className="flex align-start text-3xl font-bold pb-8">From Your Library</h1>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto h-80 pb-20">
        <div className="flex flex-row">
          {librarySongs.map((song: Song & { album_object: Album, artist_object: Artist, image: string } , index) => (
            <div className="mr-20" key={index}>
              <BigCard
                title={song.name}
                album={song.album_object}
                artist={song.artist_object}
                imageSrc={
                  song.album_object.cover_url.length === 0
                  ? "/snf.png"
                  : `http://${serverIPAddress}:${port}/server/image/${encodeURIComponent(song.album_object.cover_url)}`
                }
                albumURL=""
                songURL={`http://${serverIPAddress}:${port}/server/stream/${encodeURIComponent(song.path)}?bitrate=0`}
                type="Song"
                song={song}
                />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
