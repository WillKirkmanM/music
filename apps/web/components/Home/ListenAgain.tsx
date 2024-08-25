"use client"

import getBaseURL from "@/lib/Server/getBaseURL";
import getSession from "@/lib/Authentication/JWT/getSession";
import setCache, { getCache } from "@/lib/Caching/cache";
import { getListenHistory, getSongInfo } from "@music/sdk";
import { LibrarySong } from "@music/sdk/types";
import { useEffect, useState } from "react";
import PageGradient from "../Layout/PageGradient";
import BigCard from "../Music/Card/BigCard";
import ScrollButtons from "./ScrollButtons";

export default function ListenAgain() {
  const [listenHistorySongs, setListenHistorySongs] = useState<LibrarySong[]>([]);

  useEffect(() => {
    const fetchListenHistory = async () => {
      const cachedData = getCache("listenAgain");

      if (cachedData) {
        setListenHistorySongs(cachedData);
      } else {
        const session = getSession();
        if (session && session.sub) {
          const userId = Number(session.sub);
          if (!isNaN(userId) && userId > 0) {
            const listenHistoryItems = await getListenHistory(userId);
            const uniqueListenHistoryItems = Array.from(new Set(listenHistoryItems.map(item => item.song_id)));
            const songDetailsPromises = uniqueListenHistoryItems.reverse().slice(0, 30).map(song_id => getSongInfo(song_id));
            const songDetails = await Promise.all(songDetailsPromises);

            setListenHistorySongs(songDetails);
            setCache("listenAgain", songDetails, 3600000);
          } else {
            console.error("Invalid user ID:", userId);
          }
        } else {
          console.error("Invalid session or session.sub:", session);
        }
      }
    };

    fetchListenHistory();
  }, []);

  if (!(listenHistorySongs[0]) || listenHistorySongs.length === 0) return null;

  const albumCoverSrc = listenHistorySongs[0].album_object.cover_url.length === 0
    ? "/snf.png"
    : `${getBaseURL()}/image/${encodeURIComponent(listenHistorySongs[0].album_object.cover_url)}`;

  return listenHistorySongs && (
    <>
      <PageGradient imageSrc={albumCoverSrc} />
      <ScrollButtons heading="Listen Again">
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
                    : `${getBaseURL()}/image/${encodeURIComponent(song.album_object.cover_url)}`
                }
                albumURL=""
                songURL={`${getBaseURL()}/api/stream/${encodeURIComponent(song.path)}?bitrate=0`}
                type="Song"
                song={song}
              />
            </div>
          ))}
        </div>
      </ScrollButtons>
    </>
  );
}