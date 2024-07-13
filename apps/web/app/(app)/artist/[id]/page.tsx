import type { Library } from "@/types/Music/Library";
import { redirect } from "next/navigation";
import AlbumCard from "@/components/Music/Card/Album/AlbumCard";
import getConfig from "@/actions/Config/getConfig";
import {ScrollArea, ScrollBar} from "@music/ui/components/scroll-area"
import BigCard from "@/components/Music/Card/BigCard";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import prisma from "@/prisma/prisma";
import { Suspense } from "react";
import SongsInLibrary from "@/components/Artist/SongsInLibrary";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import Description from "@/components/Description/Description";
import GetPort from "@/actions/System/GetPort";
import PageGradient from "@/components/Layout/PageGradient";

import { Tweet, TweetSkeleton, EmbeddedTweet, TweetNotFound } from "react-tweet"
import { getTweet as _getTweet, getOEmbed } from "react-tweet/api";
import Artist from "@/types/Music/Artist";

type ArtistPage = {
  params: {
    id: number;
  };
};

export const dynamicParams = true
export const revalidate = 3600 

export async function generateMetadata({ params }: ArtistPage) {
  const id = params.id;

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  const artistRequest = await fetch(`http://${serverIPAddress}:${port}/server/artist/info/${id}`)
  const artist = await artistRequest.json()

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

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  const artistRequest = await fetch(`http://${serverIPAddress}:${port}/server/artist/info/${id}`)
  const artist: Artist = await artistRequest.json()

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

  const artistIconURL = artist.icon_url.length === 0 ? "/snf.png" : `http://${serverIPAddress}:${port}/server/image/${encodeURIComponent(artist.icon_url)}`

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
        <PageGradient imageSrc={artistIconURL} />
        <div className="flex flex-col justify-center items-center gap-8 pt-32">
          <h1 className="text-8xl font-extrabold">{artist.name}</h1>
          <h1 className="text-2xl">{formatFollowers(artist.followers)} Followers</h1>
        </div>
      </div>
      <div className="mx-52">
        <Description description={artist.description}/>
      </div>

      <p className="text-2xl text-bold">Tweets</p>
      {/* <Suspense fallback={<TweetSkeleton />}>
        <Tweet id="1786906864346681733" />
      </Suspense> */}

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
                    : `http://${serverIPAddress}:${port}/server/image/${encodeURIComponent(song.image)}`
                }
                albumURL=""
                songURL={`http://${serverIPAddress}:${port}/server/stream/${encodeURIComponent(song.path)}`}
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
