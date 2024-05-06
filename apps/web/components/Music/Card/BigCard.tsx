"use client"

import Image from "next/image"
import { usePlayer } from "../Player/usePlayer"
import SongContextMenu from "../SongContextMenu"
import Song from "@/types/Music/Song"
import Link from "next/link"
import Artist from "@/types/Music/Artist"
import Album from "@/types/Music/Album"

type BigCardProps = {
  imageSrc: string,
  title: string,
  artist: Artist,
  songURL: string,
  albumURL: string
  type: string
  song: Song
  album: Album
}

export default function BigCard({ imageSrc, title, artist, songURL, albumURL, type, song, album }: BigCardProps) {
  const {
    setImageSrc,
    setAudioSource,
    setSong,
    setArtist,
    setAlbum
  } = usePlayer()
  
  function handlePlay() {
    setImageSrc(imageSrc)
    setArtist(artist)
    setAlbum(album)
    setSong(song)
    setAudioSource(songURL)
  }

  return (
    <div className="w-36 h-36">
      <SongContextMenu song={song} album={album} artist={artist}>
        <Image src={imageSrc} alt={title + " Image"} height={256} width={256} className="rounded cursor-pointer transition-filter duration-300 hover:brightness-50" onClick={handlePlay}/>
      </SongContextMenu>

      <div className="flex flex-col text-left mt-3">
        <p className="font-bold text-white overflow-hidden overflow-ellipsis whitespace-nowrap" title={title}><Link href={`/album/${album.id}`}>{title}</Link></p>
        <p className="text-gray-400">{type} • <Link href={`/artist/${artist.id ?? "0"}`}>{artist.name}</Link></p>
      </div>
    </div>
  )
}