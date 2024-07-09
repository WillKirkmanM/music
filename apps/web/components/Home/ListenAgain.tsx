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
import ScrollButtons from "./ScrollButtons"
import GetListenHistory from "@/actions/History/GetListenHistory"


// const getCachedListenHistory = cache(
//   async () => {
//     const session = await getServerSession();
//     const username = session?.user?.username;
//     return await GetListenHistory(username ?? "", true);
//   },
//   ['listen-history'],
//   { revalidate: 120, tags: ["listen-history"] }
// );

export default async function ListenAgain() {
  // const listenHistorySongs = await getCachedListenHistory()
  const session = await getServerSession()
  const username = session?.user.username
  const listenHistorySongs = (await GetListenHistory(username ?? "", true)).slice(0, 10)

  if (!listenHistorySongs || listenHistorySongs.length === 0) return null

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  function imageToBase64(src: string) {
    const image = fs.readFileSync(src)
    const base64Image = Buffer.from(image).toString("base64");
    return base64Image;
  }

  const base64Image = imageToBase64(listenHistorySongs[0].image) || "";
  const albumCoverSrc = listenHistorySongs[0].image.length === 0 ? "/snf.png" : `data:image/jpg;base64,${base64Image}`;

  return listenHistorySongs &&
    <>
      <PageGradient imageSrc={albumCoverSrc} />
      <h1 className="flex align-start text-3xl font-bold pb-8">Listen Again</h1>
        <ScrollButtons>

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
        </ScrollButtons>
    </>
}