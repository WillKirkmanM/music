"use client"

import PlaylistCard from "@/components/Music/Playlist/PlaylistCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@music/ui/components/table"
import {} from "@tanstack/react-table"

import { usePlayer } from "@/components/Music/Player/usePlayer";
import Song from "@/types/Music/Song";
import imageToBase64 from "@/actions/ImageToBase64";
import SongContextMenu from "../SongContextMenu";
import Album from "@/types/Music/Album";
import Artist from "@/types/Music/Artist";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import getServerIpAddress from "@/actions/System/GetIpAddress";

type PlaylistTableProps = {
  songs: Song[]
  album: Album
  artist: Artist
}

export default function AlbumTable({ songs, album, artist }: PlaylistTableProps) {
  const { setImageSrc, setSong, setAudioSource, setArtist, setAlbum } = usePlayer()
  const [serverIP, setServerIP] = useState("");

  useEffect(() => {
    async function getServerIP() {
      const ip = await getServerIpAddress()
      setServerIP(ip)
    }

    getServerIP()
  })

  const handlePlay = async (coverURL: string, song: Song, songURL: string, artist: Artist) => {
    let base64Image = coverURL
    if (coverURL.length > 0) {
      base64Image = await imageToBase64(coverURL)
    }

    setImageSrc(`data:image/jpg;base64,${base64Image}`)
    setArtist(artist)
    setAlbum(album)
    setSong(song)
    setAudioSource(songURL)
  }

  function formatDuration(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="pb-36">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead className="text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>

        {songs.map(song => (
          <SongContextMenu song={song} album={album} artist={artist} key={song.id}>
            <TableBody key={song.id}>
              <TableRow onClick={() => handlePlay(album.cover_url, song, `http://${serverIP}:3001/stream/${encodeURIComponent(song.path)}`, artist)}>
                <TableCell className="font-medium">{song.track_number}</TableCell>
                <TableCell>
                  <div className="w-[300px] overflow-hidden whitespace-nowrap text-overflow">
                    <PlaylistCard song={song} coverURL={album.cover_url} artist={artist} album={album} />
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatDuration(song.duration)}</TableCell>
              </TableRow>
            </TableBody>
          </SongContextMenu>
        ))}
      </Table>
    </div>
  )
}