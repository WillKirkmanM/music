import BigCard from "./Card/BigCard";
import library from "@/public/music_with_cover_art.json";
import fs from "fs";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area"
import type { Library } from "@/types/Music/Library";

export default async function HomeSelection() {
  // const json = await fetch("http:/localhost:3001/music.json")
  // let library: Library = await json.json()

  // const firstTenArtists = library.slice(0, 50).map((artist, index) => (
  //   <div key={index}>
  //     <h2 className="text-lg">{artist.name}</h2>
  //     <p>{artist.albums.length} albums</p>
  //   </div>
  // ));

  let typedLibrary: Library = library;
  const allSongs = typedLibrary.flatMap((artist) =>
    artist.albums.flatMap((album) =>
      (album.songs.filter(Boolean) as any[]).map((song) => ({
        ...song,
        artist: artist.name,
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
  // randomSongs.forEach(song => console.log(`http://localhost:3001/stream/${encodeURIComponent(song.path)}`))
  // randomSongs.forEach(song => console.log(song.image))

  function imageToBase64(src: string) {
    const image = fs.readFileSync(src);
    const base64Image = Buffer.from(image).toString("base64");
    return base64Image;
  }

  return (
    <ScrollArea className="w-full overflow-x-auto overflow-y-auto h-full">
      <div className="flex flex-row px-5">
        {randomSongs.map((song, index) => (
          <div className="mr-20" key={index}>
            <BigCard
              title={song.name}
              artistName={song.artist}
              imageSrc={
                song.image.length === 0
                  ? "/snf.png"
                  : `data:image/jpg;base64,${imageToBase64(song.image)}`
              }
              albumURL=""
              songURL={`http://localhost:3001/stream/${encodeURIComponent(song.path)}`}
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
