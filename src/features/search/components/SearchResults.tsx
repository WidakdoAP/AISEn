import SearchResultCard from "./SearchResultCard";
import type { SearchResult } from "../types/search";

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({
  results,
}: SearchResultsProps) {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <SearchResultCard
          key={`${result.peringkat}-${result.url}`}
          result={result}
        />
      ))}
    </div>
  );
}