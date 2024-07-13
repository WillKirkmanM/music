import { Button } from "@music/ui/components/button";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import { unstable_cache as cache } from "next/cache";
import Album from "@/types/Music/Album";
import Artist from "@/types/Music/Artist";
import Image from "next/image";
import Song from "@/types/Music/Song";
import Link from "next/link";
import { Play } from "lucide-react";


async function getRandomAlbum(): Promise<{ album: Album & { artist_object: Artist }, songs: Song[] }> {
  const serverIPAddress = await getServerIpAddress();
  const port = await GetPort();

  const randomAlbumRequest = await fetch(`http://${serverIPAddress}:${port}/server/album/random/1`);
  const album: Album & { artist_object: Artist } = (await randomAlbumRequest.json())[0];

  const songs = shuffleSongs(album.songs).slice(0, 3);

  return { album, songs };
}

const getCachedRandomAlbum = cache(
  async () => await getRandomAlbum(),
  ["landing-carousel"],
  { revalidate: 3600, tags: ["landing-carousel"] }
);

type ExtendedAlbum = Album & {
  artist_object: Artist,
  artist: string
  randomSongs: Song[]
}

function shuffleSongs(array: Song[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i] as any, array[j] as any] = [array[j], array[i]];
  }
  return array;
}

function sanitizeSongName(songName: string) {
  return songName.replace(/\s+/g, '_').replace(/[^\w-]+/g, '');
}

export default async function LandingCarousel() {
  // let showcaseAlbum = await getCachedRandomAlbum() as ExtendedAlbum
  let { album, songs } = await getRandomAlbum()
  
  if (!album) return null

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  const albumCoverURL = `http://${serverIPAddress}:${port}/server/image/${encodeURIComponent(album.cover_url)}`

return (
    <div className="relative p-5 flex items-center" style={{ height: '300px' }}>
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center blur-3xl" style={{ backgroundImage: `url('${albumCoverURL}')`, filter: 'blur(12px) brightness(50%)', zIndex: '-1' }}></div>
      <div className="flex-1 flex justify-center">
        <Image src={albumCoverURL} alt="Album Cover" width={200} height={200} className="rounded-sm" style={{ maxWidth: '200px', maxHeight: '200px' }} />
      </div>
      <div className="flex-1 text-center">
        <Link href={`/album/${album.id}`}>
          <h2 className="text-xl font-bold">{album.name}</h2>
        </Link>
        <Link href={`/artist/${album.artist_object.id}`}>
          <p className="text-base">{album.artist_object.name}</p>
        </Link>
        <Link href={`/album/${album.id}`}>
          <Button className="mt-10 px-4 py-2 text-white rounded" >
            Play
            <Play className="ml-2 h-4 w-4"/>
          </Button>
        </Link>
      </div>
      <div className="flex-1">
        <p className="font-bold text-xl">Featuring songs like:</p>
        <ul>
          {songs?.map((song, index) => (
            <li key={index} className="ml-5">
              <Link href={`/album/${album.id}#${sanitizeSongName(song.name)}`}>
                {song.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}