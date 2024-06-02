import type { Library } from "@/types/Music/Library";
import { redirect } from "next/navigation";
import AlbumTable from "@/components/Music/Album/AlbumTable";
import Image from "next/image";
import imageToBase64 from "@/actions/ImageToBase64";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import getConfig from "@/actions/Config/getConfig";
import fs from "fs"
import path from "path"

type AlbumPage = {
  params: {
    id: number;
  };
};

export const dynamicParams = true
export const revalidate = 3600 

export async function generateMetadata({ params }: AlbumPage) {
  const id = params.id;

  const config = await getConfig()
  if (!config) return <p>No Library File</p>;
  const library: Library = JSON.parse(config);

  if (Object.keys(library).length === 0) {
    return (
      <p>No Results</p>
    )
  }

  const { artist, album } = library.flatMap(artist => artist.albums.map(album => ({ artist, album }))).find(({ album }) => String(album.id) === String(id)) || {};

  if (!artist || !album) redirect("/404")

  return {
    title: `${album.name} - Album by ${artist.name}`
  }
}

export async function generateStaticParams() {
  const config = await getConfig()
  if (!config) return []

  const library: Library = JSON.parse(config);

  let params = []

  if (Object.keys(library).length !== 0) {
    for (const artist of library) {
      for (const album of artist.albums) {
        params.push({ id: String(album.id) });
      }
    }
  }
    
  return params
}

export default async function AlbumPage({ params }: AlbumPage) {
  const id = params.id;

  const config = await getConfig()
  if (!config) return <p>No Library File</p>;
  const library: Library = JSON.parse(config);

  if (Object.keys(library).length === 0) {
    return (
      <p>No Results</p>
    )
  }

  const { artist, album } = library.flatMap(artist => artist.albums.map(album => ({ artist, album }))).find(({ album }) => String(album.id) === String(id)) || {};

  if (!artist || !album) redirect("/404")

  const base64Image = await imageToBase64(album.cover_url)
  const albumCoverURL = album.cover_url.length === 0 ? "/snf.png" : `data:image/jpg;base64,${base64Image}`

  
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
  
  let totalDuration = album.songs.reduce((total, song) => total + song.duration, 0)


  return ( album ?
    <ScrollArea className="h-full overflow-x-hidden overflow-y-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center my-8">
        <div className="flex items-center justify-center w-full md:w-auto md:justify-start">
          <Image src={albumCoverURL} alt={`${album.name} Image`} height={256} width={256} className="rounded mr-4 mb-4 md:mb-0" />
        </div>
        <div className="md:pl-0">
          <h1 className="text-4xl">{album.name}</h1>
          <Link href={`/artist/${artist.id}`}>
            <p className="text-3xl">{artist.name}</p>
          </Link>

          <p className="text-xl">{formatDuration(totalDuration)}</p>
        </div>
      </div>
      <AlbumTable album={album} songs={album.songs} artist={artist} key={album.id} />
      <ScrollBar />
    </ScrollArea>
    : redirect("/404")
  )
  
}
