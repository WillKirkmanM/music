import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import ClientAuth from "./ClientAuth";
import ListAlbums from "@/components/Music/ListAlbums";
import Player from "@/components/Music/Player";

export default async function Home() {
  const session = await getServerSession()
  console.log("Session", session)
  return (
    <>
      <div className="flex justify-center items-center h-screen flex-col">
      <div className="flex gap-4">
        <ClientAuth />
      </div>
        <p>Welcome</p>
      </div>
      <Player />
    </>
  );
}
