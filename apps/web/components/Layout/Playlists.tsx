import prisma from "@/prisma/prisma";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import { ListMusic, Plus } from "lucide-react";
import Link from "next/link";
import CreatePlaylistDialog from "../Music/Playlist/CreatePlaylistDialog";
import { Button } from "@music/ui/components/button";

export const dynamic = "force-dynamic"

export default async function Playlists() {
  const user = await getServerSession()
  let playlists;
  if (user) {
    playlists = await prisma.playlist.findMany({ where: { users: { some: { username: user.user.username } } }, include: { users: true } })
  }

  return (

    <div>
      <h3 className="font-heading text-white font-semibold text-xl">Playlists</h3>
      {playlists?.map(playlist => (
        <div className="pl-5 text-sm flex flex-row items-center gap-3 py-2 " key={playlist.id}>
          <ListMusic className="size-4"/>
          <Link href={"/playlist/" + playlist.id} key={playlist.id}>
            <p className="text-sm" key={playlist.id}>{playlist.name}</p>
            <p className="text-xs font-thin">Playlist • {playlist.users.map(user => user.username).join(", ")}</p>
          </Link>
        </div>
      ))}
   
      <div className="mt-6 flex justify-center">
        <CreatePlaylistDialog username={user!.user.username}>
          <Button style={{ backgroundColor: "#353535" }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Playlist
          </Button>
        </CreatePlaylistDialog>
      </div>
    </div>
  )
}