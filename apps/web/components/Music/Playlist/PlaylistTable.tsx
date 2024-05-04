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

type PlaylistTableProps = {
  songsWithMetadata: {
    artistName: string;
    coverURL: string;
    albumName: string;
    songName: string;
    contributingArtists: string;
    trackNumber: number;
    path: string;
    song: Song;
  }[]
}

export default function PlaylistTable({ songsWithMetadata }: PlaylistTableProps) {
  const { setImageSrc, setSong, setAudioSource } = usePlayer()

  const handlePlay = async (coverURL: string, song: Song, songURL: string) => {
    let base64Image = coverURL
    if (coverURL.length > 0) {
      base64Image = await imageToBase64(coverURL)
    }
    setImageSrc(`data:image/jpg:base64,${base64Image}`)
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

        {songsWithMetadata.map((song, index) => (
          <TableBody key={song.song.id}>
            <TableRow onClick={() => handlePlay(song.coverURL, song.song, `http://localhost:3001/stream/${encodeURIComponent(song.path)}`)}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="w-[300px] overflow-hidden whitespace-nowrap text-overflow">
                  <PlaylistCard song={song.song} coverURL={song.coverURL} />
                </div>
              </TableCell>
              <TableCell>{song.albumName}</TableCell>
              <TableCell className="text-right">{song.artistName}</TableCell>
            </TableRow>
          </TableBody>
        ))}
      </Table>
    </div>
  )
}