"use client"

import getBaseURL from "@/lib/Server/getBaseURL";

import PlaylistCard from "@/components/Music/Playlist/PlaylistCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@music/ui/components/table";
import { } from "@tanstack/react-table";

import { usePlayer } from "@/components/Music/Player/usePlayer";
import getSession from "@/lib/Authentication/JWT/getSession";
import { Album, Artist, LibrarySong } from "@music/sdk/types";
import SongContextMenu from "../SongContextMenu";

type PlaylistTableProps = {
  songs: LibrarySong[]
  album: Album & { artist_object: Artist }
  artist: Artist
}

export default function AlbumTable({ songs, album, artist }: PlaylistTableProps) {
  const { setImageSrc, setSong, setAudioSource, setArtist, setAlbum, addToQueue } = usePlayer()

  const session = getSession()
  const bitrate = session?.bitrate ?? 0

  const handlePlay = async (coverURL: string, song: LibrarySong, songURL: string, artist: Artist) => {
    setImageSrc(`${getBaseURL()}/image/${encodeURIComponent(album.cover_url)}`);
    setArtist(artist);
    setAlbum(album);
    setSong(song);
    setAudioSource(songURL);
  
    let track_number = song.track_number;
  
    const songsToQueue = album.songs.filter((s) => s.track_number >= track_number);
    songsToQueue.forEach((s) => {
      addToQueue(s, album, artist);
    });
  };

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
            <TableBody key={song.id} >
              <TableRow id={sanitizeSongName(song.name)} onClick={() => handlePlay(album.cover_url, song, `${getBaseURL()}/api/stream/${encodeURIComponent(song.path)}?bitrate=${bitrate}`, artist)}>
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
