import prisma from "@/prisma/prisma";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import { ListMusic } from "lucide-react";
import Link from "next/link";
import CreatePlaylistDialog from "../Music/Playlist/CreatePlaylistDialog";

export const dynamic = "force-dynamic"

export default async function Playlists() {
  const user = await getServerSession()
  let playlists;
  if (user) {
    playlists = await prisma.playlist.findMany({ where: { users: { some: { username: user.user.username } } } })
  }

  return (

    <div>
      <h3 className="font-heading text-white font-semibold text-xl">Playlists</h3>
      {playlists?.map(playlist => (
        <div className="pl-5 text-sm flex flex-row items-center gap-3 py-2" key={playlist.id}>
          <ListMusic className="size-4"/>
          <Link href={"/playlist/" + playlist.id} key={playlist.id}>
            <p key={playlist.id}>{playlist.name}</p>
          </Link>
        </div>
      ))}
   
      {user?.user.username && (
        <CreatePlaylistDialog username={user!.user.username}>Create Playlist</CreatePlaylistDialog>
      )}
    </div>
  )
}