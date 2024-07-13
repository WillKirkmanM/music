"use client"

import PlaylistCard from "@/components/Music/Playlist/PlaylistCard";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@music/ui/components/table"
import { ScrollArea } from "@music/ui/components/scroll-area"
import { usePlayer } from "@/components/Music/Player/usePlayer";
import Song from "@/types/Music/Song";
import imageToBase64 from "@/actions/ImageToBase64";
import SongContextMenu from "../SongContextMenu";
import Artist from "@/types/Music/Artist";
import Album from "@/types/Music/Album";
import Link from "next/link";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import GetPort from "@/actions/System/GetPort";

type PlaylistTableProps = {
  songsWithMetadata: (Song & { artist_object: Artist; album_object: Album })[];
}

export default function PlaylistTable({ songsWithMetadata }: PlaylistTableProps) {
  const { setImageSrc, setSong, setArtist, setAudioSource, setAlbum } = usePlayer()
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

  const handlePlay = async (coverURL: string, song: Song, songURL: string, artist: Artist, album: Album) => {
    setImageSrc(`http://${serverIP}:${port}/image/${encodeURIComponent(coverURL)}`)
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
            <TableHead className="w-[200px]">Album</TableHead>
            <TableHead className="w-[200px]">Duration</TableHead>
            <TableHead className="text-right">Artist</TableHead>
          </TableRow>
        </TableHeader>

        {songsWithMetadata.map((song: Song & { album_object: Album, artist_object: Artist }, index) => (
          <SongContextMenu song={song} album={song.album_object} artist={song.artist_object} key={song.id}>
            <TableBody key={song.id}>
              <TableRow onClick={() => handlePlay(song.album_object.cover_url, song, `http://${serverIP}:${port}/server/stream/${encodeURIComponent(song.path)}?bitrate=${bitrate}`, song.artist_object, song.album_object)}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="w-[300px] overflow-hidden whitespace-nowrap text-overflow">
                    <PlaylistCard song={song} coverURL={song.album_object.cover_url} artist={song.artist_object} album={song.album_object} />
                  </div>
                </TableCell>
                <TableCell><Link onClick={(e) => e.stopPropagation()} href={`/album/${song.album_object.id}`}>{song.album_object.name}</Link></TableCell>
                <TableCell>{formatDuration(song.duration)}</TableCell>
                <TableCell className="text-right"><Link onClick={(e) => e.stopPropagation()}href={`/artist/${song.artist_object.id}`}>{song.artist_object.name}</Link></TableCell>
              </TableRow>
            </TableBody>
          </SongContextMenu>
        ))}
      </Table>
    </div>
  )
}