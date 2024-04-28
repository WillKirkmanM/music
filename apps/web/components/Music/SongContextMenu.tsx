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
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import IconPlus from "../Icons/IconPlus";
import IconQueue from "../Icons/IconQueue";
import IconGoToArtist from "../Icons/IconGoToArtist";
import PlusCircle from "../Icons/PlusCircle";
import ArrowUpCircle from "../Icons/ArrowUpCircle";
import Bars3Left from "../Icons/Bars3Left";
import Song from "@/types/Music/Song";

export default function SongContextMenu({
  children,
  song,
}: {
  children: React.ReactNode;
  song: Song;
}) {
  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>

        <ContextMenuContent className="w-64">
          <ContextMenuItem>
            <IconPlus />
            Add to Playlist
          </ContextMenuItem>

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
                <TableCell className="font-medium">
                  Track Number
                </TableCell>
                <TableCell>
                  {song.track_number}
                </TableCell>
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
