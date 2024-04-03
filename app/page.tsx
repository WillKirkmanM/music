import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import ClientAuth from "../components/Authentication/ClientAuth";
import ListAlbums from "@/components/Music/ListAlbums";
import Player from "@/components/Music/Player";

export default async function Home() {
  const session = await getServerSession()

  return (
    <>
      <div className="flex justify-center items-center h-screen flex-col bg-gradient-to-t from-gray-900 to-gray-700">
      <div className="fixed top-0 right-0 p-4">
        <ClientAuth />
      </div>
        {session ? (<p>Welcome {session.user!.username ?? session.user?.name}</p>) : (<p>Hey! Sign in...</p>)}
        <Player />
      </div>
    </>
  );
}
