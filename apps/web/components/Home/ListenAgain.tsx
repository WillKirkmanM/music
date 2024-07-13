import getServerSession from "@/lib/Authentication/Sessions/GetServerSession"
import BigCard from "../Music/Card/BigCard"
import getServerIpAddress from "@/actions/System/GetIpAddress"
import GetPort from "@/actions/System/GetPort"
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

  const albumCoverSrc = listenHistorySongs[0].album_object.cover_url.length === 0 ? "/snf.png" : `http://${serverIPAddress}:${port}/server/image/${encodeURIComponent(listenHistorySongs[0].album_object.cover_url)}`;

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
                album={song.album_object}
                artist={song.artist_object}
                imageSrc={
                  song.album_object.cover_url.length === 0
                  ? "/snf.png"
                  : `http://${serverIPAddress}:${port}/server/image/${encodeURIComponent(song.album_object.cover_url)}`
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