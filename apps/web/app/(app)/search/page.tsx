import { miniSearch } from "@/lib/Search/search";
import Link from "next/link";
import SearchResultCard from "@/components/Music/Card/Search/SearchResultCard";
import TopResultsCard from "@/components/Music/Card/Search/TopResultsCard";

type SearchParamsProps = {
  searchParams: {
    q: string;
  };
};

export default async function SearchPage({ searchParams }: SearchParamsProps) {
  const minisearch = await miniSearch;
  const query = searchParams.q;

  const results = minisearch?.search(query).slice(0, 20);
  const suggestion = minisearch?.autoSuggest(query, { fields: ["name"] })[0]

  return (
    <div className="pt-20">

      {suggestion && (suggestion.suggestion.toLowerCase() !== query.toLowerCase()) && 
        <p className="text-sm text-white mt-6">
          Did you mean: {" "}
          <Link href={`/search?q=${suggestion.suggestion}`} className="text-gray-200 hover:underline">{suggestion.suggestion}</Link>
        </p>
      }

      <p className="text-2xl pb-5">Top Result</p>

      <div className="flex jusitfy-start rounded-3xl bg-slate-400">
        {results && results[0] && <TopResultsCard result={results[0]}/>}
      </div>
      <div className="grid grid-cols-5 gap-4 pb-36">
        {results?.slice(1).map((result) => (
          <SearchResultCard result={result} key={result.id}/>
        ))}
      </div>
  </div>
  );
}
