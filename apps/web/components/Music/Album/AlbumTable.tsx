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
import { useSession } from "next-auth/react";
import GetPort from "@/actions/System/GetPort";

type PlaylistTableProps = {
  songs: Song[]
  album: Album & { artist_object: Artist }
  artist: Artist
}

export default function AlbumTable({ songs, album, artist }: PlaylistTableProps) {
  const { setImageSrc, setSong, setAudioSource, setArtist, setAlbum } = usePlayer()
  const [serverIP, setServerIP] = useState("");
  const [port, setPort] = useState(0)

  const session = useSession()
  const bitrate = session.data?.user.bitrate

  useEffect(() => {
    async function getServerInformation() {
      const ip = typeof window !== 'undefined' ? window.location.hostname : await getServerIpAddress();
      setServerIP(ip);

      const port = typeof window !== 'undefined' ? parseInt(window.location.port) : await GetPort();
      setPort(port);
    }

    getServerInformation();
  }, []);

  const handlePlay = async (coverURL: string, song: Song, songURL: string, artist: Artist) => {
    setImageSrc(`http://${serverIP}:${port}/server/image/${encodeURIComponent(album.cover_url)}`)
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

  function sanitizeSongName(songName: string) {
    return songName.replace(/\s+/g, '_').replace(/[^\w-]+/g, '');
  }

  return (
    <div className="pb-24">
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
              <TableRow id={sanitizeSongName(song.name)} onClick={() => handlePlay(album.cover_url, song, `http://${serverIP}:${port}/server/stream/${encodeURIComponent(song.path)}?bitrate=${bitrate}`, artist)}>
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