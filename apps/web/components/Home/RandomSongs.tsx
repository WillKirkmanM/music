import BigCard from "../Music/Card/BigCard";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import { unstable_cache as cache } from "next/cache";
import Album from "@/types/Music/Album";
import Artist from "@/types/Music/Artist";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";

export const revalidate = 3600

type ResponseSong = {
  id: string;
  name: string;
  artist: string;
  contributing_artists: string[];
  track_number: number;
  path: string;
  duration: number;
  album_object: Album;
  artist_object: Artist;
};

async function getRandomSongs(): Promise<ResponseSong[]> {
  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  const randomSongsRequest = await fetch(`http://${serverIPAddress}:${port}/server/song/random/10`)
  const randomSongs: ResponseSong[] = await randomSongsRequest.json()

  return randomSongs
}

const getCachedRandomSongs = cache(
  async () => await getRandomSongs(),
  ['random-songs'],
  { revalidate: 3600, tags: ["random-songs"] }
);


export default async function RandomSongs() {
  // let randomSongs = await getCachedRandomSongs()
  let randomSongs = await getRandomSongs()

  if (!randomSongs || randomSongs.length === 0) return null

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
