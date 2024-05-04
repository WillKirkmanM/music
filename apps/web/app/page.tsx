import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import ClientAuth from "../components/Authentication/ClientAuth";
import ListAlbums from "@/components/Music/ListAlbums";
import Player from "@/components/Music/Player";
import HomeSelection from "@/components/Music/HomeSelection";
import { PlayerProvider } from "@/components/Music/Player/usePlayer";
import { Suspense } from "react";
import ToggleTheme from "@/components/Themes/ToggleTheme";

export default async function Home() {
  return (
    <div className="flex justify-center items-center h-screen flex-col pt-5">
      <HomeSelection />
      <HomeSelection />
    </div>
  );
}
