import Image from "next/image"
import imageToBase64 from "@/actions/ImageToBase64"
import type Artist from "@/types/Music/Artist"
import type Album from "@/types/Music/Album"
import Link from "next/link"
import getServerIpAddress from "@/actions/System/GetIpAddress"
import GetPort from "@/actions/System/GetPort"

type AlbumCardProps = {
  artist: Artist
  album: Album
}

export default async function AlbumCard({ artist, album }: AlbumCardProps) {
  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()
  // const base64Image = await imageToBase64(album.cover_url)
  const albumCoverURL = (!album.cover_url || album.cover_url.length === 0) ? "/snf.png" : `http://${serverIPAddress}:${port}/server/image/${encodeURIComponent(album.cover_url)}`
  let releaseDate = new Date(album.first_release_date).toLocaleString('default', { year: 'numeric' });

  return (
    <div className="w-44 h-44">
      <Link href={`/album/${album.id}`}>
        <Image src={albumCoverURL} alt={album.name + " Image"} height={256} width={256} className="rounded cursor-pointer transition-filter duration-300 hover:brightness-50" />
        <p className="font-bold text-white overflow-hidden overflow-ellipsis whitespace-nowrap" title={album.name}>{album.name}</p>
      </Link>

      <Link href={`/artist/${artist.id}`}>
        <p className="text-gray-400">
          {artist.name} • {releaseDate}
        </p>
      </Link>

    </div>
  )
}