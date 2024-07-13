import imageToBase64 from "@/actions/ImageToBase64"
import getServerIpAddress from "@/actions/System/GetIpAddress"
import GetPort from "@/actions/System/GetPort"
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
  const [serverIP, setServerIP] = useState("")
  const [port, setPort] = useState(0)

  useEffect(() => {
    async function getServerInformation() {
      const ip = typeof window !== 'undefined' ? window.location.hostname : await getServerIpAddress();
      setServerIP(ip);

      const port = typeof window !== 'undefined' ? parseInt(window.location.port) : await GetPort();
      setPort(port);
    }

    getServerInformation();
  }, []);

  useEffect(() => {
    async function loadImage() {
      if (serverIP && port) {
        coverURL.length > 0 ? setImageSrc(`http://${serverIP}:${port}/server/image/${encodeURIComponent(coverURL)}`) : setImageSrc("/snf.png")
      }
    }

    loadImage()
  }, [serverIP, port, coverURL])

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