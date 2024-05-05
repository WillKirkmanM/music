import untypedLibrary from "@/public/music_with_cover_art.json";
import type { Library } from "@/types/Music/Library";
import type Album from "@/types/Music/Album";
import { redirect } from "next/navigation";
import AlbumTable from "@/components/Music/Album/AlbumTable";
import Image from "next/image";
import imageToBase64 from "@/actions/ImageToBase64";
import Link from "next/link";

type ArtistPage = {
  params: {
    id: number;
  };
};

export default async function ArtistPage({ params }: ArtistPage) {
  const id = params.id;
  const library = untypedLibrary as Library;

  // const album = library.flatMap(artist => artist.albums).find(album => String(album.id) === String(id));
  const { artist, album } = library.flatMap(artist => artist.albums.map(album => ({ artist, album }))).find(({ album }) => String(album.id) === String(id)) || {};

  if (!artist || !album) redirect("/404")

  const base64Image = await imageToBase64(album.cover_url)
  const albumCoverURL = album.cover_url.length === 0 ? "/snf.png" : `data:image/jpg;base64,${base64Image}`
    
  return ( album ?
    <>
      <div className="flex items-center my-8">
        <Image src={albumCoverURL} alt={album.name + " Image"} height={256} width={256} className="rounded mr-4" />
        <div>
          <h1 className="text-4xl">{album.name}</h1>
          <Link href={`/artist/${artist.id}`}>
            <p className="text-3xl">{artist.name}</p>
          </Link>
        </div>
      </div>
      <AlbumTable album={album} songs={album.songs} key={album.id} />
    </>
    : redirect("/404")
  )
}
