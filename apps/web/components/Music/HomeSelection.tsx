import BigCard from "./Card/BigCard";
import getConfig from "@/actions/Config/getConfig";
import fs from "fs";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import type { Library } from "@/types/Music/Library";
import getServerIpAddress from "@/actions/System/GetIpAddress";

export default async function HomeSelection() {
  const config = await getConfig()
  if (!config) return []

  const typedLibrary: Library = JSON.parse(config);

  if (Object.keys(typedLibrary).length === 0) {
  return (
    <div>
      <h2>No data available</h2>
    </div>
  );
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
  );

  // Shuffle the array
  for (let i = allSongs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
  }

  const randomSongs = allSongs.slice(0, 10);

  function imageToBase64(src: string) {
    const image = fs.readFileSync(src)
    const base64Image = Buffer.from(image).toString("base64");
    return base64Image;
  }

  return (
    <ScrollArea className="w-full overflow-x-auto overflow-y-auto h-full">
      <div className="flex flex-row">
        {randomSongs.map(async (song, index) => (
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
              songURL={`http://${await getServerIpAddress()}:3001/stream/${encodeURIComponent(song.path)}`}
              type="Song"
              song={song}
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
