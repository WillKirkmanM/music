import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import ClientAuth from "../components/Authentication/ClientAuth";
import ListAlbums from "@/components/Music/ListAlbums";
import Player from "@/components/Music/Player";
import HomeSelection from "@/components/Music/HomeSelection";
import { PlayerProvider } from "@/components/Music/Player/usePlayer";
import { Suspense } from "react";

export default async function Home() {
  const session = await getServerSession()

  return (
    <>
      {/* <div className="text-4xl text-white jusify-center text-center">{session && session.user && <p>Welcome {session?.user.username}</p>}</div> */}
      <div className="flex justify-center items-center h-screen flex-col">
        <HomeSelection />
      </div>

    </>
  );
}
