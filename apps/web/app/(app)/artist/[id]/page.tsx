import type { Library } from "@/types/Music/Library";
import { redirect } from "next/navigation";
import AlbumCard from "@/components/Music/Card/Album/AlbumCard";
import path from "path"
import fs from "fs"
import getConfig from "@/actions/Config/getConfig";

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

  let params = [];

  if (Object.keys(library).length > 0) {
    for (const artist of library) {
      params.push({ id: String(artist.id) });
    }
  }

  return params;
}

export default async function ArtistPage({ params }: ArtistPage) {
  const id = params.id;

  const config = await getConfig()
  if (!config) return <p>No Library</p>
  
  const library: Library = JSON.parse(config);

  if (Object.keys(library).length === 0) {
    return (
      <div>
        <h2>No data available</h2>
      </div>
    );
  }

  const artist = library.find((artist: any) => String(artist.id) === String(id));

  const albums = artist!.albums;

  return artist ? (
    <>
      <h1 className="text-4xl text-center mb-8">{artist.name}</h1>
      <div className="flex flex-wrap justify-center items-start pb-48">
        {albums.map((album, index) => (
          <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-8">
            <AlbumCard artist={artist} album={album} />
          </div>
        ))}
      </div>
    </>
  ) : (
    redirect("/404")
  );
}
