import { mockSearchResults, mockAISummary } from "../features/search/mocks/searchMock";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

import {
  useLocation,
  useSearchParams,
} from "react-router";
import {
  Search,
  LoaderCircle,
  AlertCircle,
  BookOpen,
  Settings,
  ChevronDown,
} from "lucide-react";

import SearchBar from "../features/search/components/SearchBar";
import SearchResults from "../features/search/components/SearchResults";
import { searchDocuments } from "../features/search/services/searchApi";
import type { SearchResult } from "../features/search/types/search";

// Wrapper: remount halaman ketika URL pencarian berubah.
export default function SearchPage() {
  const location = useLocation();

  return (
    <SearchPageContent key={location.search} />
  );
}

function SearchPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";

  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(Boolean(query.trim()));
  const [error, setError] = useState<string | null>(null);
  const [relevance, setRelevance] = useState(50);
  const [optionsOpen, setOptionsOpen] = useState(false);
  
  const optionsRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;
  
    if (!page) return;
  
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
  
    const ctx = gsap.context(() => {
      gsap.from("[data-animate]", {
        opacity: 0,
        y: 14,
        duration: 0.55,
        stagger: 0.12,
        ease: "power2.out",
      });
    }, page);
  
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const dropdown = optionsRef.current;
  
    if (!dropdown || !optionsOpen) return;
  
    const ctx = gsap.context(() => {
      gsap.fromTo(
        dropdown,
        {
          opacity: 0,
          y: -8,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.22,
          ease: "power2.out",
        }
      );
    }, dropdown);
  
    return () => ctx.revert();
  }, [optionsOpen]);
  
  // Fetch results whenever URL query changes.
  useEffect(() => {
    if (!query.trim()) return;
  
    const controller = new AbortController();

    const USE_MOCK_DATA = true;
  
    async function fetchResults() {
      setLoading(true);
      setError(null);
  
      try {
        const data = USE_MOCK_DATA
          ? mockSearchResults
          : await searchDocuments(query, controller.signal);
  
        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }
  
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mencari dokumen."
        );
  
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
  
    fetchResults();
  
    return () => controller.abort();
  }, [query]);

  function handleSearch() {
    const trimmedInput = input.trim();

    if (!trimmedInput) return;

    setSearchParams({ q: trimmedInput });
  }

  function handleClearSearch() {
    setInput("");
    setSearchParams({});
  }

  return (
    <main ref={pageRef} className="academia-page flex min-h-screen flex-col">
      {/* Header */}
      <header data-animate className="academia-header">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <a href="/" className="flex w-fit items-center gap-3">
            <div className="academia-brand-icon">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="text-left">
              <h1 className="academia-brand-title text-lg font-bold">
                AISEn
              </h1>

              <p className="academia-brand-subtitle text-xs">
                Artificial Intelligence Search Engine
              </p>
            </div>
          </a>
        </div>
      </header>

      {/* Search section */}
      <section data-animate className="academia-search-section">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      
          
          <div className="mb-5 flex items-start justify-between gap-4">
            {/* Heading */}
            <div className="min-w-0">
              <h2 className="academia-section-title text-xl font-semibold">
                Temukan Penelitian
              </h2>
          
              <p className="academia-section-description mt-1 text-sm">
                Cari publikasi akademik menggunakan fitur pencarian
                berbasis kecerdasan buatan.
              </p>
            </div>
          
            {/* Options dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setOptionsOpen((previous) => !previous)}
                aria-label="Pengaturan pencarian"
                aria-expanded={optionsOpen}
                className={`academia-options-button ${
                  optionsOpen ? "is-active" : ""
                }`}
              >
                <Settings
                  className={`h-5 w-5 transition-transform duration-300 ${
                    optionsOpen ? "rotate-90" : ""
                  }`}
                />
                <span className="hidden sm:inline">Options</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    optionsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
          
              {/* Dropdown content */}
              {optionsOpen && (
                <div
                  ref={optionsRef}
                  className="academia-options-dropdown"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3>Preferensi Pencarian</h3>
          
                    <button
                      type="button"
                      onClick={() => setOptionsOpen(false)}
                      aria-label="Tutup pengaturan"
                      className="academia-options-close"
                    >
                      ×
                    </button>
                  </div>
          
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label htmlFor="relevance-slider">
                        Relevansi
                      </label>
          
                      <span className="academia-relevance-value">
                        {relevance}%
                      </span>
                    </div>
          
                    <input
                      id="relevance-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={relevance}
                      onChange={(event) =>
                        setRelevance(Number(event.target.value))
                      }
                      className="academia-range w-full"
                    />
          
                    <div className="mt-2 flex justify-between text-xs">
                      <span>Lebih luas</span>
                      <span>Lebih spesifik</span>
                    </div>
                  </div>
          
                  <div className="academia-options-divider" />
          
                  <p className="academia-options-description">
                    Pengaturan ini akan memengaruhi preferensi
                    relevansi hasil pencarian.
                  </p>
                </div>
              )}
            </div>
          </div>

      
          {/* Search bar */}
          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={handleSearch}
            onClear={handleClearSearch}
          />
      
          {/* AI Summary */}
          {!loading && !error && query && results.length > 0 && (
            <div className="academia-ai-summary mt-6">
              <div className="academia-ai-summary-header">
                <div className="academia-ai-icon">
                  <BookOpen className="h-5 w-5" />
                </div>
      
                <div>
                  <h3 className="font-semibold">
                    {mockAISummary.title}
                  </h3>
      
                  <p className="text-xs">
                    AI-generated overview · Demo data
                  </p>
                </div>
              </div>
      
              <p className="academia-ai-summary-content">
                {mockAISummary.content}
              </p>
      
              <div className="academia-ai-keywords">
                {mockAISummary.keywords.map((keyword) => (
                  <span key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Results section */}
      <section className="academia-results mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {!query ? (
          <div className="py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Mulai pencarian
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Masukkan topik, permasalahan, atau konsep penelitian
              yang ingin kamu temukan.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-slate-500">
                Hasil pencarian untuk
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900 wrap-anywhere">
                "{query}"
              </h2>

              {!loading && !error && (
                <p className="mt-2 text-sm text-slate-500">
                  {results.length} dokumen ditemukan
                </p>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center py-16">
                <LoaderCircle className="h-8 w-8 animate-spin text-blue-700" />

                <p className="mt-4 text-sm text-slate-500">
                  Sedang mencari dokumen yang relevan...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />

                  <h3 className="font-semibold">
                    Pencarian gagal
                  </h3>
                </div>

                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Empty results */}
            {!loading && !error && results.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-300" />

                <h3 className="mt-4 font-semibold text-slate-800">
                  Tidak ada dokumen ditemukan
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Coba gunakan kata kunci atau deskripsi yang berbeda.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && !error && results.length > 0 && (
              <SearchResults results={results} />
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer data-animate className="academia-footer mt-auto">
         <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs sm:px-6">
          Footer
        </div>
      </footer>
    </main>
  );
}
