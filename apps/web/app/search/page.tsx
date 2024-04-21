import BigCard from '@/components/Music/Card/BigCard';
import { miniSearch } from '@/lib/Search/search';
import Song from '@/types/Music/Song';
import fs from "fs"

type SearchParamsProps = {
  searchParams: {
    q: string
  }
}

type SearchResults = { 
  results: SearchContent[] 
}

export interface SearchContent {
  id: string
  score: number
  terms: string[]
  queryTerms: string[]
  match: Match
  artistName: string
  coverURL: string
  albumName: string
  songName: string
  song: Song
}

type Match = {
  [term: string]: string[]; 
}


export default async function SearchPage({ searchParams }: SearchParamsProps) {
  const minisearch = await miniSearch
  const query = searchParams.q

  const result = minisearch.search(query).slice(0, 20)

  function imageToBase64(src: string) {
      const image = fs.readFileSync(src);
      const base64Image = Buffer.from(image).toString('base64');
      return base64Image;
  }

  return (
    <div className='grid grid-cols-5 gap-4'>
        {result?.map(result => (
          <div key={result.id} className="flex flex-col items-center p-14">
            <BigCard 
              artistName={result.artistName}
              songURL={`http://localhost:3001/stream/${encodeURIComponent(result.id)}`}
              title={result.songName}
              type="Song"
              imageSrc={(result.coverURL.startsWith("http") || result.coverURL == ""  ) ? "/snf.png" : `data:image/jpg;base64,${imageToBase64(result.coverURL)}`}
              albumURL=''
              song={result.song}
            />
          </div>
        ))}
    </div>
  );
}