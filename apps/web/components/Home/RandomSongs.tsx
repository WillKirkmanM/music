import BigCard from "../Music/Card/BigCard";
import getConfig from "@/actions/Config/getConfig";
import fs from "fs";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import type { Library } from "@/types/Music/Library";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import { unstable_cache as cache } from "next/cache";

export const revalidate = 3600

async function getRandomSongs() {
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
  
  // Shuffle the array
  for (let i = allSongs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
  }
  
  const randomSongs = allSongs.slice(0, 10);

  return randomSongs
}

const getCachedRandomSongs = cache(
  async () => await getRandomSongs(),
  ['random-songs'],
  { revalidate: 3600, tags: ["random-songs"] }
);


export default async function RandomSongs() {
  let randomSongs = await getCachedRandomSongs()

  if (!randomSongs || randomSongs.length === 0) return null

  function imageToBase64(src: string) {
    const image = fs.readFileSync(src)
    const base64Image = Buffer.from(image).toString("base64");
    return base64Image;
  }

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  return (
    <>
      <h1 className="flex align-start text-3xl font-bold pb-8">Random Selection</h1>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto h-80 pb-20">
        <div className="flex flex-row">
          {randomSongs.map((song, index) => (
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
