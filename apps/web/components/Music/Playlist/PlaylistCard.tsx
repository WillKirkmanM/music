import imageToBase64 from "@/actions/ImageToBase64"
import Song from "@/types/Music/Song"
import Image from "next/image"
import { useEffect, useState } from "react"

type PlaylistCardProps = {
  song: Song,
  coverURL: string
}

export default function PlaylistCard({ song, coverURL }: PlaylistCardProps) {
  // let imageSrc = coverURL.length === 0 ? "/snf.png" : `data:image/jpg;base64,${imageToBase64(coverURL)}`

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
        <p>{song.name}</p>
        <p>{song.artist}</p>
      </div>
    </div>
  )
}