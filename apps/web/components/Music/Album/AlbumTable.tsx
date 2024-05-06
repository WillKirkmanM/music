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
import { usePlayer } from "@/components/Music/Player/usePlayer";
import Song from "@/types/Music/Song";
import imageToBase64 from "@/actions/ImageToBase64";
import SongContextMenu from "../SongContextMenu";
import { SessionProvider } from "next-auth/react";
import Album from "@/types/Music/Album";

type PlaylistTableProps = {
  songs: Song[]
  album: Album
}

export default function AlbumTable({ songs, album }: PlaylistTableProps) {
  const { setImageSrc, setSong, setAudioSource } = usePlayer()

  const handlePlay = async (coverURL: string, song: Song, songURL: string) => {
    let base64Image = coverURL
    if (coverURL.length > 0) {
      base64Image = await imageToBase64(coverURL)
    }

    setImageSrc(`data:image/jpg;base64,${base64Image}`)
    setSong(song)
    setAudioSource(songURL)
  }

  return (
    <div className="pb-36">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead className="w-[200px]">Album</TableHead>
            <TableHead className="text-right">Artist</TableHead>
          </TableRow>
        </TableHeader>

        <SessionProvider>
          {songs.map(song => (
            <SongContextMenu song={song} key={song.id}>
              <TableBody key={song.id}>
                <TableRow onClick={() => handlePlay(album.cover_url, song, `http://localhost:3001/stream/${encodeURIComponent(song.path)}`)}>
                  <TableCell className="font-medium">{song.track_number}</TableCell>
                  <TableCell>
                    <div className="w-[300px] overflow-hidden whitespace-nowrap text-overflow">
                      <PlaylistCard song={song} coverURL={album.cover_url} />
                    </div>
                  </TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell className="text-right">{song.artist}</TableCell>
                </TableRow>
              </TableBody>
            </SongContextMenu>
          ))}
        </SessionProvider>
      </Table>
    </div>
  )
}