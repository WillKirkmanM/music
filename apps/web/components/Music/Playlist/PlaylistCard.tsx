import imageToBase64 from "@/actions/ImageToBase64"
import Album from "@/types/Music/Album"
import Artist from "@/types/Music/Artist"
import Song from "@/types/Music/Song"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type PlaylistCardProps = {
  song: Song,
  coverURL: string
  artist: Artist
  album: Album
}

export default function PlaylistCard({ song, coverURL, artist, album }: PlaylistCardProps) {
  const [imageSrc, setImageSrc] = useState("")

  useEffect(() => {
    async function loadImage() {
      if (coverURL.length > 0) {
        const base64Image = await imageToBase64(coverURL)
        setImageSrc(`data:image/jpg;base64,${base64Image}`)
      } else {
        setImageSrc("/snf.png")
      }
    }

    loadImage()
  }, [coverURL])

  return (
    <div className="flex items-center">
      <Image src={imageSrc} alt={song.name + " Image"} width={64} height={64} className="rounded" />
      <div className="flex flex-col ml-4">
        <Link onClick={(e) => e.stopPropagation()} href={`/album/${album.id}`}><p>{song.name}</p></Link>
        <Link onClick={(e) => e.stopPropagation()} href={`/artist/${artist.id}`}><p>{song.artist}</p></Link>
      </div>
    </div>
  )
}