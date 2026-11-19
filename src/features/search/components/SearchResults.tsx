import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

import type { SearchResult } from "../types/search";
import SearchResultCard from "./SearchResultCard";

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({
  results,
}: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resultKey = useMemo(
    () => results.map((result) => result.peringkat).join(","),
    [results]
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-result-card]",
        {
          opacity: 0,
          y: 12,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
        }
      );
    }, container);

    return () => ctx.revert();
  }, [resultKey]);

  return (
    <div ref={containerRef} className="space-y-4">
      {results.map((result) => (
        <div
          key={result.peringkat}
          id={`document-${result.peringkat}`}
          tabIndex={-1}
          data-result-card
        >
          <SearchResultCard result={result} />
        </div>
      ))}
    </div>
  );
}