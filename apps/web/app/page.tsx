import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import ClientAuth from "../components/Authentication/ClientAuth";
import ListAlbums from "@/components/Music/ListAlbums";
import Player from "@/components/Music/Player";
import HomeSelection from "@/components/Music/HomeSelection";
import { PlayerProvider } from "@/components/Music/Player/usePlayer";

export default async function Home() {
  const session = await getServerSession()

  return (
    <>
      <PlayerProvider>
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="fixed top-0 right-0 p-4">
          {session ? (<p>Welcome {session.user!.username ?? session.user?.name}</p>) : (<p>Hey! Sign in...</p>)}
          <ClientAuth />
        </div>

        <HomeSelection />
      </div>

        <Player />
      </PlayerProvider>
    </>
  );
}
