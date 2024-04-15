"use client"

import Image from "next/image"
import { PlayerProvider, usePlayer } from "../Player/usePlayer"
import SongMenuContext from "@/components/Music/SongContextMenu"
import Song from "@/types/Music/Song"

type BigCardProps = {
  imageSrc: string,
  title: string,
  artistName: string,
  songURL: string,
  albumURL: string
  type: string
  song: Song
}

export default function BigCard({ imageSrc, title, artistName, songURL, albumURL, type, song }: BigCardProps) {
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
    <div className="w-36 h-36">
      <SongMenuContext>
        <Image src={imageSrc} alt={title + " Image"} height={256} width={256} className="rounded cursor-pointer transition-filter duration-300 hover:brightness-50" onClick={handlePlay}/>
      </SongMenuContext>

      <div className="flex flex-col text-left mt-3">
        <p className="font-bold text-white overflow-hidden overflow-ellipsis whitespace-nowrap" title={title}>{title}</p>
        <p className="text-gray-400">{type} • {artistName}</p>
      </div>
    </div>
  )
}