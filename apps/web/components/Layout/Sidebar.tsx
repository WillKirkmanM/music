import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import Link from "next/link";
import prisma from "@/prisma/prisma";
import { Button } from "@music/ui/components/button";
import CreatePlaylistDialog from "../Music/Playlist/CreatePlaylistDialog";
import { ListMusic, Plus } from "lucide-react";

export async function Sidebar() {
  const user = await getServerSession()
  let playlists;
  if (user) playlists = await prisma.playlist.findMany({ where: { users: { some: { username: user.user.username } } } })
  return (
    <aside className="fixed left-0 hidden h-full w-1/5 space-y-2 p-4 lg:block xl:w-[15%] border-r">
      <h3 className="font-heading text-xl">Welcome</h3>

      {playlists?.map(playlist => {
        return (
          <div className="pl-5 text-sm flex flex-row items-center gap-3 py-2" key={playlist.id}>
            <ListMusic className="size-4"/>
            <Link href={"/playlist/" + playlist.id} key={playlist.id}>
              <p key={playlist.id}>{playlist.name}</p>
            </Link>
          </div>
        )
      })}
 
      {user && (
        <CreatePlaylistDialog username={user.user.username}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Playlist
          </Button>
        </CreatePlaylistDialog>
      )}

    </aside>
  );
}
