import getServerSession from "@/lib/Authentication/Sessions/GetServerSession"
import getConfig from "@/actions/Config/getConfig"
import prisma from "@/prisma/prisma"
import type { Library } from "@/types/Music/Library"
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import BigCard from "../Music/Card/BigCard"
import getServerIpAddress from "@/actions/System/GetIpAddress"
import GetPort from "@/actions/System/GetPort"
import { unstable_cache as cache } from "next/cache"
import fs from "fs"
import PageGradient from "../Layout/PageGradient"

export async function GetListenHistory() {
  const session = await getServerSession()
  if (!session) {
    throw new Error("Session not found")
  }

  const username = session.user.username
  if (!username) {
    throw new Error("Username not found")
  }

  const userWithListenHistory = await prisma.user.findUnique({
    where: {
      username
    },
    include: {
      listenHistory: {
        orderBy: {
          listenedAt: 'desc'
        },
        take: 10,
      },
    },
  })

  if (!userWithListenHistory) {
    throw new Error("User not found")
  }

  const listenHistorySongIds = userWithListenHistory.listenHistory.map(historyItem => historyItem.songId)

  const config = await getConfig()
  if (!config) return []

  const typedLibrary: Library = JSON.parse(config)
  if (Object.keys(typedLibrary).length === 0) {
    return []
  }

  const allSongs = typedLibrary.flatMap((artist) =>
    artist.albums.flatMap((album) =>
      (album.songs.filter(Boolean) as any[]).map((song) => ({
        ...song,
        artistObject: artist,
        albumObject: album,
        album: album.name,
        image: album.cover_url,
      }))
    )
  )

  const uniqueSongIds = Array.from(new Set(listenHistorySongIds))
  let listenHistorySongs = allSongs.filter(song => uniqueSongIds.includes(String(song.id)))

  listenHistorySongs = uniqueSongIds.map(songId => listenHistorySongs.find(song => String(song.id) === songId)).filter(Boolean)

  return listenHistorySongs
}

const getCachedListenHistory = cache(
  async () => await GetListenHistory(),
  ['listen-history'],
  { revalidate: 120 }
);

export default async function ListenAgain() {
  const listenHistorySongs = await getCachedListenHistory()
  // const listenHistorySongs = await GetListenHistory()

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  function imageToBase64(src: string) {
    const image = fs.readFileSync(src)
    const base64Image = Buffer.from(image).toString("base64");
    return base64Image;
  }

  const base64Image = await imageToBase64(listenHistorySongs[0].image);
  const albumCoverSrc = listenHistorySongs[0].image.length === 0 ? "/snf.png" : `data:image/jpg;base64,${base64Image}`;

  return (
    <>
      <PageGradient imageSrc={albumCoverSrc} />
      <h1 className="flex align-start text-3xl font-bold pb-8">Listen Again</h1>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto h-80 pb-20">
        <div className="flex flex-row">
          {listenHistorySongs.map((song, index) => (
            <div className="mr-20" key={index}>
              <BigCard
                title={song.name}
                album={song.albumObject}
                artist={song.artistObject}
                imageSrc={
                  song.image.length === 0
                  ? "/snf.png"
                  : `data:image/jpg;base64,${imageToBase64(song.image)}`
                }
                albumURL=""
                songURL={`http://${serverIPAddress}:${port}/server/stream/${encodeURIComponent(song.path)}?bitrate=0`}
                type="Song"
                song={song}
                />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}