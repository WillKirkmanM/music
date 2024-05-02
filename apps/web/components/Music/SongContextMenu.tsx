import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@music/ui/components/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@music/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@music/ui/components/table";


import IconPlus from "../Icons/IconPlus";
import IconQueue from "../Icons/IconQueue";
import IconGoToArtist from "../Icons/IconGoToArtist";
import PlusCircle from "../Icons/PlusCircle";
import ArrowUpCircle from "../Icons/ArrowUpCircle";
import Bars3Left from "../Icons/Bars3Left";
import Song from "@/types/Music/Song";
import { useSession } from "next-auth/react";
import { useState, useEffect, useTransition } from "react";
import GetPlaylist from "@/actions/GetPlaylist";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import AddSongToPlaylist from "@/actions/AddSongToPlaylist";

export default function SongContextMenu({
  children,
  song,
}: {
  children: React.ReactNode;
  song: Song;
}) {
  const [playlists, setPlaylists] = useState<
    { id: string; name: string; createdAt: Date; updatedAt: Date }[] | undefined
  >(undefined);
  const session = useSession();

  useEffect(() => {
    const getPlaylists = async () => {
      if (session.status != "loading" && session.status == "authenticated") {
        let playlists = await GetPlaylist(session.data.user.username);
        setPlaylists(playlists);
      }
    };
    getPlaylists();
  }, [session]);

  const [isPending, startTransition] = useTransition()

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>

        <ContextMenuContent className="w-64">
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Add to Playlist</ContextMenuSubTrigger>
            {playlists && playlists.length !== 0 && (
              <ContextMenuSubContent className="w-48">
                {playlists?.map((playlist) => (
                  <div key={playlist.name}>
                    <ContextMenuItem onClick={() => startTransition(() => AddSongToPlaylist(String(song.id), playlist.id))}>{playlist.name}</ContextMenuItem>
                  </div>
                ))}
              </ContextMenuSubContent>
            )}
          </ContextMenuSub>

          <ContextMenuItem>
            <IconQueue />
            Add to Queue
          </ContextMenuItem>

          <ContextMenuItem>
            <PlusCircle />
            Add to Liked
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem>
            <IconGoToArtist className="w-6 h-6" />
            Go to Artist
          </ContextMenuItem>

          <ContextMenuItem>
            <ArrowUpCircle />
            Go to Album
          </ContextMenuItem>

          <ContextMenuCheckboxItem>
            <Bars3Left />
            View Credits
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>Copy Song Link</ContextMenuItem>
              <ContextMenuItem>Embed track</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <DialogTrigger asChild>
            <ContextMenuItem>
              <PlusCircle />
              View Properties
            </ContextMenuItem>
          </DialogTrigger>
        </ContextMenuContent>
      </ContextMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Song Information</DialogTitle>
          <Table>
            <TableHeader></TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Song Name</TableCell>
                <TableCell>{song.name}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Artist</TableCell>
                <TableCell>{song.artist}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  Contributing Artists
                </TableCell>
                <TableCell>
                  {song.contributing_artists.length === 0
                    ? "N/A"
                    : song.contributing_artists.join(", ")}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Track Number</TableCell>
                <TableCell>{song.track_number}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">ID</TableCell>
                <TableCell>{song.id}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
