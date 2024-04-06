"use client"

import Image from "next/image"
import { usePlayer } from "../usePlayer"
import SongMenuContext from "@/components/Music/SongContextMenu"

type BigCardProps = {
  imageSrc: string,
  title: string,
  artistName: string,
  songURL: string,
  albumURL: string
}

export default function BigCard({ imageSrc, title, artistName, songURL, albumURL }: BigCardProps) {
  const {
    playAudioSource
  } = usePlayer(songURL)

  return (
    <div className="w-36 h-36">
      <SongMenuContext>
        <Image src={imageSrc} alt={title + " Image"} height={256} width={256} className="rounded cursor-pointer transition-filter duration-300 hover:brightness-50" onClick={() => playAudioSource()}/>
      </SongMenuContext>

      <div className="flex flex-col text-left mt-3">
        <p className="font-bold text-white">{title}</p>
        <p className="text-gray-400">Song • {artistName}</p>
      </div>
    </div>
  )
}