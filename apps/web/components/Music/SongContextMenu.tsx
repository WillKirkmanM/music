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
import GetPlaylists from "@/actions/Playlist/GetPlaylists";
import AddSongToPlaylist from "@/actions/Playlist/AddSongToPlaylist";
import { CircleArrowUp, CirclePlus, ExternalLink, ListEnd, Plus, UserRoundSearch } from "lucide-react";

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
        let playlists = await GetPlaylists(session.data.user.username);
        setPlaylists(playlists);
      }
    };
    getPlaylists();
  }, [session]);

  const [isPending, startTransition] = useTransition()

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

        <ContextMenuContent className="w-64">
          <ContextMenuSub>
            <ContextMenuSubTrigger >
              <Plus className="size-5"/>
              <p className="pl-3">Add to Playlist</p>
            </ContextMenuSubTrigger>
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
            <ListEnd className="size-5"/>
            <p className="pl-3">Add to Queue</p>
          </ContextMenuItem>

          <ContextMenuItem>
            <CirclePlus className="size-5"/>
            <p className="pl-3">Add to Liked</p>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem>
            <UserRoundSearch className="size-5"/>
            <p className="pl-3">Go to Artist</p>
          </ContextMenuItem>

          <ContextMenuItem>
            <CircleArrowUp className="size-5"/>
            <p className="pl-3">Go to Album</p>
          </ContextMenuItem>

          <ContextMenuItem>
            <Bars3Left className="size-5"/>
            <p className="pl-3">View Credits</p>
          </ContextMenuItem>

          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <ExternalLink className="size-5"/>
              <p className="pl-3">Share</p>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>Copy Song Link</ContextMenuItem>
              <ContextMenuItem>Embed track</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <DialogTrigger asChild>
            <ContextMenuItem>
              <CirclePlus className="size-5"/>
              <p className="pl-3">View Properties</p>
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
