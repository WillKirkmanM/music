import untypedLibrary from "@/public/music_with_cover_art.json";
import type { Library } from "@/types/Music/Library";
import { redirect } from "next/navigation";
import AlbumCard from "@/components/Music/Card/Album/AlbumCard";

type ArtistPage = {
  params: {
    id: number;
  };
};

export const dynamicParams = true

export async function generateStaticParams() {
  let library: Library = untypedLibrary

  let params = []

  for (const artist of library) {
    params.push({ id: String(artist.id) });
  }

  return params
}

export default function ArtistPage({ params }: ArtistPage) {
  const id = params.id;
  const library = untypedLibrary as Library;

  const artist = library.find(
    (artist: any) => String(artist.id) === String(id)
  );
  const albums = artist!.albums;

  return artist ? (
    <>
      <h1 className="text-4xl text-center mb-8">{artist.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 space-y-16 justify-items-center">
        {albums.map((album, index) => (
          <div key={index}>
            <AlbumCard artist={artist} album={album} />
          </div>
        ))}
      </div>
    </>
  ) : (
    redirect("/404")
  );
}
