import React from 'react';
import BigCard from '../BigCard';
import ArtistCard from '../../Artist/ArtistCard';
import { SearchResult } from 'minisearch';
import imageToBase64 from '@/actions/ImageToBase64';
import AlbumCard from '../Album/AlbumCard';
import getServerIpAddress from '@/actions/System/GetIpAddress';

type ResultCardProps = {
  result: SearchResult
}

export default async function TopResultsCard({ result }: ResultCardProps) {
  if (result.type === 'Song') {
    return (
      <div key={result.id} className="flex flex-col items-center p-14">
        <BigCard
          artist={result.artist}
          album={result.album}
          songURL={`http://${await getServerIpAddress()}:3001/stream/${encodeURIComponent(result.song.path)}`}
          title={result.name}
          type="Song"
          imageSrc={
            result.album.cover_url.length == 0
            ? "/snf.png"
            : `data:image/jpg;base64,${await imageToBase64(result.album.cover_url)}`
          }
          albumURL=""
          song={result.song}
        />
      </div>
    );
  } else if (result.type === 'Artist') {
    return (
      <div key={result.id} className="flex flex-col items-center p-14">
        <ArtistCard artist={result.artist}/>
      </div>
    );
  } else if (result.type === 'Album') {
    return (
      <div key={result.id} className="flex flex-col items-center p-14">
        <AlbumCard album={result.album} artist={result.artist} />
      </div>
    );
  }
}