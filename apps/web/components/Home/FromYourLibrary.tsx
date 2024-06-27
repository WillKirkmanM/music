import BigCard from "../Music/Card/BigCard";
import getConfig from "@/actions/Config/getConfig";
import fs from "fs";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import type { Library } from "@/types/Music/Library";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import { unstable_cache as cache } from "next/cache";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import prisma from "@/prisma/prisma";

export const revalidate = 3600

async function getSongsFromYourLibrary() {
  const config = await getConfig()
  if (!config) return []
  
  const typedLibrary: Library = JSON.parse(config);
  
  if (Object.keys(typedLibrary).length === 0) {
    return []
  }
  
  const allSongs = typedLibrary.flatMap((artist) =>
    artist.albums.flatMap((album) =>
      (album.songs.filter(Boolean) as any[]).map((song) => ({
        ...song,
        artistObject: artist,
        albumObject: album,
        album: album.name,
        image: album.cover_url,
      }))
    )
  );

  const allSongsIDs = allSongs.map(song => song.id)
 
  const session = await getServerSession()
  const username = session?.user.username
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

const librarySongs = allSongs.filter(song => playlistSongIDs.includes(String(song.id)));

return librarySongs;
}

// const getCachedSongsFromYourLibrary = cache(
//   async () => await getSongsFromYourLibrary(),
//   ['from-your-library'],
//   { revalidate: 300, tags: ["from-your-library"] }
// );


export default async function FromYourLibrary() {
  // let librarySongs = await getCachedSongsFromYourLibrary()
  let librarySongs = await getSongsFromYourLibrary()

  function imageToBase64(src: string) {
    const image = fs.readFileSync(src)
    const base64Image = Buffer.from(image).toString("base64");
    return base64Image;
  }

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  return (
    <>
      <h1 className="flex align-start text-3xl font-bold pb-8">From Your Library</h1>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto h-80 pb-20">
        <div className="flex flex-row">
          {librarySongs.map((song, index) => (
            <div className="mr-20" key={index}>
              <BigCard
                title={song.name}
                album={song.albumObject}
                artist={song.artistObject}
                imageSrc={
                  song.image.length === 0
                  ? "/snf.png"
                  : `data:image/jpg;base64,${imageToBase64(song.image)}`
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
