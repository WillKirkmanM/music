import BigCard from "@/components/Music/Card/BigCard";
import imageToBase64 from "@/lib/Image/imageToBase64";
import { miniSearch } from "@/lib/Search/search";
import Song from "@/types/Music/Song";
import { useEffect, useState } from "react";
import Loading from "./loading";
import Artist from "@/types/Music/Artist";

type SearchParamsProps = {
  searchParams: {
    q: string;
  };
};

type SearchResults = {
  results: SearchContent[];
};

export interface SearchContent {
  id: string;
  score: number;
  terms: string[];
  queryTerms: string[];
  match: Match;
  artistName: string;
  coverURL: string;
  albumName: string;
  songName: string;
  song: Song;
}

type Match = {
  [term: string]: string[];
};

export default async function SearchPage({ searchParams }: SearchParamsProps) {
  const minisearch = await miniSearch;
  const query = searchParams.q;

  const results = minisearch.search(query).slice(0, 20);

  return (
    <div className="grid grid-cols-5 gap-4 pt-20 pb-36">
      {results?.map((result) => (
        <div key={result.id} className="flex flex-col items-center p-14">
          <BigCard
            artist={result.artist}
            songURL={`http://localhost:3001/stream/${encodeURIComponent(result.id)}`}
            title={result.songName}
            type="Song"
            imageSrc={
              result.coverURL.length == 0
                ? "/snf.png"
                : `data:image/jpg;base64,${imageToBase64(result.coverURL)}`
            }
            albumURL=""
            song={result.song}
          />
        </div>
      ))}
    </div>
  );
}
