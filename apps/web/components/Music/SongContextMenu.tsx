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
} from "@/components/ui/context-menu"
import IconPlus from "../Icons/IconPlus"
import IconQueue from "../Icons/IconQueue"
import IconGoToArtist from "../Icons/IconGoToArtist"
import PlusCircle from "../Icons/PlusCircle"
import ArrowUpCircle from "../Icons/ArrowUpCircle"
import Bars3Left from "../Icons/Bars3Left"

export default function MusicContextMenu({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>

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
              <ContextMenuItem>
                Copy Song Link
              </ContextMenuItem>
              <ContextMenuItem>Embed track</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

      </ContextMenuContent>
    </ContextMenu>
  )
}
