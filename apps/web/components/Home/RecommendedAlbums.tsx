import fs from "fs";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import prisma from "@/prisma/prisma";
import AlbumCard from "../Music/Card/Album/AlbumCard";

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

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  const songsDetailsPromises = playlistSongIDs.map(songID =>
    fetch(`http://${serverIPAddress}:${port}/server/song/info/${songID}`).then(response => response.json())
  );

  const songsDetails = await Promise.all(songsDetailsPromises);

  return songsDetails;
}

// const getCachedSongsFromYourLibrary = cache(
//   async () => await getSongsFromYourLibrary(),
//   ['recommended-albums'],
//   { revalidate: 300, tags: ["recommended-albums"] }
// );


export default async function RecommendedAlbums() {
  // let librarySongs = await getCachedSongsFromYourLibrary()
  let librarySongs = await getSongsFromYourLibrary()

  if (!librarySongs|| librarySongs.length === 0) return null

  return (
    <>
      <h1 className="flex align-start text-3xl font-bold pb-8">Recommended Albums</h1>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto h-80 pb-20">
        <div className="flex flex-row">
          {librarySongs.map((song, index) => (
            <div className="mr-20" key={index}>
              <AlbumCard 
                album={song.album_object}
                artist={song.artist_object}
                key={song.id}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
