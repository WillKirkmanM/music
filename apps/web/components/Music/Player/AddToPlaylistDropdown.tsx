
"use client"

import AddSongToPlaylist from "@/actions/Playlist/AddSongToPlaylist"
import GetPlaylists from "@/actions/Playlist/GetPlaylists"
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuShortcut } from "@music/ui/components/dropdown-menu"
import { ScrollArea } from "@music/ui/components/scroll-area"
import { useSession } from "next-auth/react"
import { startTransition, useEffect, useState } from "react"
import { usePlayer } from "./usePlayer"
import CheckCircle from "@/components/Icons/CheckCircle"
import Song from "@/types/Music/Song"
import { Playlist } from "@prisma/client"

type AddToPlaylistDropdownProps = {
  children: React.ReactNode
}

export default function AddToPlaylistDropdown({ children }: AddToPlaylistDropdownProps) {
  const session = useSession();
  const { song, isPlaying } = usePlayer()

  const [playlists, setPlaylists] = useState<(Playlist & { songs: Song[] })[]>([]);

  useEffect(() => {
    const getPlaylists = async () => {
      if (session.status != "loading" && session.status == "authenticated") {
        let playlists = await GetPlaylists(session.data.user.username);
        setPlaylists(playlists as any as (Playlist & { songs: Song[] })[]); 
      }
    };

    if (isPlaying) {
      getPlaylists();
    }
  }, [session, isPlaying, song.id]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea>
          {playlists && playlists.map(playlist => (
            <DropdownMenuItem key={playlist.id} onClick={() => startTransition(() => AddSongToPlaylist(String(song.id), playlist.id))}>
              {playlist.name}
              <DropdownMenuShortcut>
                {/* Converting to Strings due to JS' precision limits for numbers. Numbers between -(2^53 - 1) and 2^53 - 1; Any number outside this range can lose precision. The Song ID's are larger than 2^53 -1 (9e15)*/}
                {playlist.songs.some(playlistSong => String(playlistSong.id) === String(song.id)) ? <CheckCircle className="m-4"/> : "empty circle"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}