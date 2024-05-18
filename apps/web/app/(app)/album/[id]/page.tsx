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

type ArtistPage = {
  params: {
    id: number;
  };
};

export const dynamicParams = true
export const dynamic = "force-dynamic"

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

export default async function AlbumPage({ params }: ArtistPage) {
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

  return ( album ?
    <ScrollArea className="h-full overflow-x-hidden overflow-y-auto">
      <div className="flex items-center my-8">
        <Image src={albumCoverURL} alt={album.name + " Image"} height={256} width={256} className="rounded mr-4" />
        <div>
          <h1 className="text-4xl">{album.name}</h1>
          <Link href={`/artist/${artist.id}`}>
            <p className="text-3xl">{artist.name}</p>
          </Link>
        </div>
      </div>
      <AlbumTable album={album} songs={album.songs} artist={artist} key={album.id} />
      <ScrollBar />
    </ScrollArea>
    : redirect("/404")
  )
}
