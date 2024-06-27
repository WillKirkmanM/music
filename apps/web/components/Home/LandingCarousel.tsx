import BigCard from "../Music/Card/BigCard";
import getConfig from "@/actions/Config/getConfig";
import fs from "fs";
import { Button } from "@music/ui/components/button";
import type { Library } from "@/types/Music/Library";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import { unstable_cache as cache } from "next/cache";
import Album from "@/types/Music/Album";
import Artist from "@/types/Music/Artist";
import imageToBase64 from "@/actions/ImageToBase64";
import Image from "next/image";
import Song from "@/types/Music/Song";
import Link from "next/link";
import ShimmerButton from "@music/ui/components/shimmer-button";
import { Play } from "lucide-react";
import { FastAverageColor } from "fast-average-color";

export const revalidate = 3600

async function getRandomAlbum() {
  const config = await getConfig()
  if (!config) return []
  
  const typedLibrary: Library = JSON.parse(config);
  
  if (Object.keys(typedLibrary).length === 0) {
    return []
  }

  const allAlbums: ExtendedAlbum[] = typedLibrary.flatMap((artist) =>
    artist.albums.map((album) => ({
      ...album,
      artistObject: artist,
      artist: artist.name,
    }))
  ).filter(album => album.cover_url.length > 0);

  for (let i = allAlbums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allAlbums[i] as any, allAlbums[j] as any] = [allAlbums[j], allAlbums[i]];
  }
  
  const randomAlbum = allAlbums[0] as ExtendedAlbum;

  return randomAlbum;
}

const getCachedRandomAlbum = cache(
  async () => await getRandomAlbum(),
  ["landing-carousel"],
  { revalidate: 3600, tags: ["landing-carousel"] }
);

type ExtendedAlbum = Album & {
  artistObject: Artist,
  artist: string
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
  let showcaseAlbum = await getCachedRandomAlbum() as ExtendedAlbum

  if (!showcaseAlbum) return null

  const base64Image = await imageToBase64(showcaseAlbum.cover_url)
  const albumCoverURL = `data:image/jpg;base64,${base64Image}`

  const getCachedRandomSongs = cache(async () => shuffleSongs([...showcaseAlbum.songs]).slice(0, 3), ["landing-carousel-songs"], { revalidate: 3600, tags: ["landing-carousel-songs"] })
  const randomSongs = await getCachedRandomSongs()

return (
    <div className="relative p-5 flex items-center" style={{ height: '300px' }}>
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center blur-3xl" style={{ backgroundImage: `url('${albumCoverURL}')`, filter: 'blur(12px) brightness(50%)', zIndex: '-1' }}></div>
      <div className="flex-1 flex justify-center">
        <Image src={albumCoverURL} alt="Album Cover" width={200} height={200} className="rounded-sm" style={{ maxWidth: '200px', maxHeight: '200px' }} />
      </div>
      <div className="flex-1 text-center">
        <Link href={`/album/${showcaseAlbum.id}`}>
          <h2 className="text-xl font-bold">{showcaseAlbum.name}</h2>
        </Link>
        <Link href={`/artist/${showcaseAlbum.artistObject.id}`}>
          <p className="text-base">{showcaseAlbum.artist}</p>
        </Link>
        <Link href={`/album/${showcaseAlbum.id}`}>
          <Button className="mt-10 px-4 py-2 text-white rounded" >
            Play
            <Play className="ml-2 h-4 w-4"/>
          </Button>
        </Link>
      </div>
      <div className="flex-1">
        <p className="font-bold text-xl">Featuring songs like:</p>
        <ul>
          {randomSongs.map((song: Song, index) => (
            <li key={index} className="ml-5">
              <Link href={`/album/${showcaseAlbum.id}#${sanitizeSongName(song.name)}`}>
                {song.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}