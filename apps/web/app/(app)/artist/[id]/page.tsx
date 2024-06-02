import type { Library } from "@/types/Music/Library";
import { redirect } from "next/navigation";
import AlbumCard from "@/components/Music/Card/Album/AlbumCard";
import path from "path"
import fs from "fs"
import getConfig from "@/actions/Config/getConfig";
import {ScrollArea, ScrollBar} from "@music/ui/components/scroll-area"
import BigCard from "@/components/Music/Card/BigCard";
import imageToBase64 from "@/lib/Image/imageToBase64";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import prisma from "@/prisma/prisma";
import { Metadata } from "next";
import Image from "next/image";
import { startTransition, Suspense } from "react";
import SongsInLibrary from "@/components/Artist/SongsInLibrary";
import getServerIpAddress from "@/actions/System/GetIpAddress";

type ArtistPage = {
  params: {
    id: number;
  };
};

export const dynamicParams = true
export const revalidate = 3600 

export async function generateMetadata({ params }: ArtistPage) {
  const id = params.id;

  const config = await getConfig()
  if (!config) return <p>No Library</p>
  
  const library: Library = JSON.parse(config);

  if (Object.keys(library).length === 0) {
    return (
      <div>
        <h2>No data available</h2>
      </div>
    );
  }

  const artist = library.find((artist: any) => String(artist.id) === String(id));

  if (!artist) redirect("/404")
  
  return {
    title: artist.name
  }
}

export async function generateStaticParams() {
  const config = await getConfig()
  if (!config) return []

  const library: Library = JSON.parse(config);

  let params = [];

  if (Object.keys(library).length > 0) {
    for (const artist of library) {
      params.push({ id: String(artist.id) });
    }
  }

  return params;
}

export default async function ArtistPage({ params }: ArtistPage) {
  const id = params.id;

  const config = await getConfig()
  if (!config) return <p>No Library</p>
  
  const library: Library = JSON.parse(config);

  if (Object.keys(library).length === 0) {
    return (
      <div>
        <h2>No data available</h2>
      </div>
    );
  }

  const artist = library.find((artist: any) => String(artist.id) === String(id));

  if (!artist) redirect("/404")

  const albums = artist!.albums;

  const allSongs = artist!.albums.flatMap((album) =>
    album.songs.map((song) => ({
      ...song,
      artistObject: artist,
      albumObject: album,
      album: album.name,
      image: album.cover_url,
    }))
  );

  for (let i = allSongs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSongs[i], allSongs[j]] = [allSongs[j] as typeof allSongs[0], allSongs[i] as typeof allSongs[0]];
  }

  const randomSongs = allSongs.slice(0, 20);

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
      .filter(song => songIds.includes(Number(song.id)))
      .map(song => song.id)
  );

  const base64Image = await imageToBase64(artist.icon_url)
  const artistIconURL = artist.icon_url.length === 0 ? "/snf.png" : `data:image/jpg;base64,${base64Image}`

  function formatFollowers(followers: number): string {
    if (followers >= 1000000) {
      return (followers / 1000000).toFixed(1) + 'M';
    } else if (followers >= 1000) {
      return (followers / 1000).toFixed(1) + 'K';
    } else {
      return followers.toString();
    }
  }

  return artist ? (
    <>
      <div style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%), url(${artistIconURL})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        height: "500px" 
      }}>
        <div className="flex flex-col justify-center items-center gap-8 pt-32">
          <h1 className="text-8xl font-extrabold">{artist.name}</h1>
          <h1 className="text-2xl">{formatFollowers(artist.followers)} Followers</h1>
        </div>
      </div>
      <p className="text-2xl text-bold">Songs</p>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto mb-4 h-72">
        <div className="flex flex-row justify-center items-start">
          {randomSongs.map(async (song, index) => (
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
                songURL={`http://${await getServerIpAddress()}:3001/stream/${encodeURIComponent(song.path)}`}
                type="Song"
                song={song}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal"/>
      </ScrollArea>

      <p className="text-2xl text-bold">Albums</p>
      <ScrollArea className="w-full overflow-x-auto overflow-y-auto mb-4 h-64">
        <div className="flex flex-row items-start">
          {albums.map((album, index) => (
            <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-8">
              <AlbumCard artist={artist} album={album} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal"/>
      </ScrollArea>

      <Suspense>
        <SongsInLibrary allSongs={allSongs}/>
      </Suspense>

      <div className="pb-48"/>
    </>
  ) : (
    redirect("/404")
  );
}
