import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import prisma from "@/prisma/prisma";
import Album from "@/types/Music/Album";
import Artist from "@/types/Music/Artist";
import BigCard from "../Music/Card/BigCard";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import imageToBase64 from "@/actions/ImageToBase64";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";

type SongsInLibraryProps = {
  allSongs: allSongs[]
}

type allSongs = {
  artistObject: Artist;
  albumObject: Album;
  album: string;
  image: string;
  id: string;
  name: string;
  artist: string;
  contributing_artists: string[];
  track_number: number;
  path: string;
  duration: number;
}

export default async function SongsInLibrary({ allSongs }: SongsInLibraryProps) {

  const songIds = allSongs.map(song => song.id);

  const session = await getServerSession()
  const username = session?.user.username
  const songsFromPlaylist = await prisma.playlist.findMany({
    where: {
      users: {
        some: {
          username
        }
      },
      songs: {
        some: {
          id: {
            in: songIds.map(String)
          },
        },
      },
    },
    select: {
      songs: {
        select: {
          id: true
        }
      }
    }
  });

  const songIdsFromPlaylist = songsFromPlaylist.flatMap(playlist => 
    playlist.songs
      .filter(song => songIds.includes(song.id))
      .map(song => song.id)
  );

  const songsInLibrary = allSongs.filter(song => songIdsFromPlaylist.includes(String(song.id)));


  return songsInLibrary.length > 0 && (
    <>
      <p className="text-2xl text-bold">In your Library</p>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto mb-4 h-64">
        <div className="flex flex-row justify-start items-start">
          {songsInLibrary.map(async (song, index) => (
            <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-8">
              <BigCard
                title={song.name}
                album={song.albumObject}
                artist={song.artistObject}
                imageSrc={
                  song.image.length === 0
                  ? "/snf.png"
                  : `data:image/jpg;base64,${await imageToBase64(song.image)}`
                }
                albumURL=""
                songURL={`http://${await getServerIpAddress()}:${await GetPort()}/server/stream/${encodeURIComponent(song.path)}`}
                type="Song"
                song={song}
                />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal"/>
      </ScrollArea>
    </>
  )}