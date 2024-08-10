"use client"

import Description from "@/components/Description/Description";
import PageGradient from "@/components/Layout/PageGradient";
import AlbumTable from "@/components/Music/Album/AlbumTable";
import getBaseURL from "@/lib/Server/getBaseURL";
import { getAlbumInfo, LibraryAlbum } from "@music/sdk";
import { Artist } from "@music/sdk/types";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import Image from "next/image";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AlbumComponent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id")

  const [album, setAlbum] = useState<LibraryAlbum | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchAlbum = async () => {
      const album = await getAlbumInfo(id)
      const artistData = album.artist_object;

      if (!artistData || !album) {
        redirect("/404");
      } else {
        setAlbum(album);
        setArtist(artistData);
      }
    };

    fetchAlbum();
  }, [id]);

  if (!album || !artist) {
    return null;
  }

  const albumCoverURL = album.cover_url.length === 0 ? "/snf.png" : `${getBaseURL()}/image/${encodeURIComponent(album.cover_url)}?raw=true`;

  function formatDuration(duration: number) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.round(duration % 60);

    let result = '';
    if (hours > 0) {
      result += `${hours} Hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      result += `${minutes} Minute${minutes > 1 ? 's' : ''} `;
    }
    return result.trim();
  }

  let totalDuration = album.songs.reduce((total, song) => total + song.duration, 0);
  let releaseDate = new Date(album.first_release_date).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-full">
    <Image className="bg-cover bg-center blur-3xl w-full h-full" src={albumCoverURL} height={800} width={800} alt={`${album.name} Cover URL`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', filter: 'blur(24px) brightness(50%)',  objectFit: 'cover', objectPosition: 'center' }} />
      <div className="flex-1 h-full overflow-x-hidden overflow-y-auto relative">
        <ScrollArea className="h-full w-full">
          <PageGradient imageSrc={albumCoverURL} />
          <div className="flex flex-col md:flex-row items-start md:items-center my-8">
            <div className="flex items-center justify-center w-full md:w-auto md:justify-start">
              <Image
                src={albumCoverURL}
                alt={`${album.name} Image`}
                height={256}
                width={256}
                className="rounded mr-4 mb-4 md:mb-0"
              />
            </div>
            <div className="md:pl-0">
              <h1 className="text-4xl">{album.name}</h1>
              <Link href={`/artist?id=${artist.id}`}>
                <p className="text-3xl">{artist.name}</p>
              </Link>
              <p>{releaseDate}</p>
              <div className="flex flex-row gap-2">
                <p>{album.songs.length} Songs</p>
                <p>•</p>
                <p>{formatDuration(totalDuration)}</p>
              </div>
            </div>
          </div>
          <Description description={album.description} />
          <AlbumTable album={album} songs={album.songs} artist={artist} key={album.id} />
          <ScrollBar />
        </ScrollArea>
      </div>
    </div>
  );
}