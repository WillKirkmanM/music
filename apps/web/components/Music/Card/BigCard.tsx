"use client"

import Image from "next/image"
import { usePlayer } from "../Player/usePlayer"
import SongContextMenu from "../SongContextMenu"
import Song from "@/types/Music/Song"
import { SessionProvider } from "next-auth/react"
import Link from "next/link"
import Artist from "@/types/Music/Artist"

type BigCardProps = {
  imageSrc: string,
  title: string,
  artist: Artist
  songURL: string,
  albumURL: string
  type: string
  song: Song
}

export default function BigCard({ imageSrc, title, artist, songURL, albumURL, type, song }: BigCardProps) {
  const {
    setImageSrc,
    setAudioSource,
    setSong,
  } = usePlayer()
  
  function handlePlay() {
    setImageSrc(imageSrc)
    setSong(song)
    setAudioSource(songURL)
  }

  return (
    <SessionProvider>
    <div className="w-36 h-36">
      <SongContextMenu song={song}>
        <Image src={imageSrc} alt={title + " Image"} height={256} width={256} className="rounded cursor-pointer transition-filter duration-300 hover:brightness-50" onClick={handlePlay}/>
      </SongContextMenu>

      <div className="flex flex-col text-left mt-3">
        <p className="font-bold text-white overflow-hidden overflow-ellipsis whitespace-nowrap" title={title}>{title}</p>
        <p className="text-gray-400">{type} • <Link href={`/artist/${artist.id ?? "0"}`}>{artist.name}</Link></p>
      </div>
    </div>
    </SessionProvider>
  )
}