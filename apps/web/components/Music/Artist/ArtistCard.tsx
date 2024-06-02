import Image from "next/image"
import imageToBase64 from "@/actions/ImageToBase64"
import type Artist from "@/types/Music/Artist"
import type Album from "@/types/Music/Album"
import Link from "next/link"

type ArtistCardProps = {
  artist: Artist
}

function formatFollowers(followers: number): string {
  if (followers >= 1000000) {
    return (followers / 1000000).toFixed(1) + 'M';
  } else if (followers >= 1000) {
    return (followers / 1000).toFixed(1) + 'K';
  } else {
    return followers.toString();
  }
}

export default async function ArtistCard({ artist }: ArtistCardProps) {
  const base64Image = await imageToBase64(artist.icon_url)
  const artistIconURL = artist.icon_url.length === 0 ? "/snf.png" : `data:image/jpg;base64,${base64Image}`

return (
  <Link href={`/artist/${artist.id}`}>
    <div className="w-44 h-44 flex items-center justify-center">
      <div className="flex flex-row items-center gap-2">
        <Image width={256} height={256} src={artistIconURL} alt={`${artist.name} Image`} className="rounded-full"/>
        <div className="flex flex-col items-center justify-center">
          <p className="font-bold text-white overflow-hidden overflow-ellipsis whitespace-nowrap" title={artist.name}>{artist.name}</p>
          <p className="font-bold text-white overflow-hidden overflow-ellipsis whitespace-nowrap" title={artist.name}>{formatFollowers(artist.followers)} Followers</p>
        </div>
      </div>
    </div>
  </Link>
)
}