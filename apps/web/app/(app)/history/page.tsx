import GetListenHistory from "@/actions/History/GetListenHistory";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";
import BigCard from "@/components/Music/Card/BigCard";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import { ScrollArea } from "@music/ui/components/scroll-area";
import fs from "fs";

export default async function HistoryPage() {
  const session = await getServerSession();
  const username = session?.user.username;
  let listenHistorySongs = await GetListenHistory(username ?? "");

  const serverIPAddress = await getServerIpAddress();
  const port = await GetPort();

  function imageToBase64(src: string) {
    const image = fs.readFileSync(src);
    const base64Image = Buffer.from(image).toString("base64");
    return base64Image;
  }

  return (
      <>
        <h1 className="text-3xl font-bold pt-20">History</h1>
  
        <ScrollArea>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full w-full">
            {listenHistorySongs.map((song, index) => (
              <div className="h-64" key={index}>
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
        </ScrollArea>
      </>
    );
}
