
import { useEffect, useState } from "react";
import {
  useLocation,
  useSearchParams,
} from "react-router";

import {
  Search,
  LoaderCircle,
  AlertCircle,
  BookOpen,
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

  // Fetch results whenever URL query changes.
  useEffect(() => {
    if (!query.trim()) return;

    const controller = new AbortController();

    searchDocuments(query, controller.signal)
      .then((data) => {
        setResults(data);
        setError(null);
      })
      .catch((err: unknown) => {
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
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [query]);

  function handleSearch() {
    const trimmedInput = input.trim();

    if (!trimmedInput) return;

    setSearchParams({ q: trimmedInput });
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <a href="/" className="flex w-fit items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-white">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="text-left">
              <h1 className="text-lg font-bold text-slate-900">
                AISEn
              </h1>

              <p className="text-xs text-slate-500">
                Artificial Inteliggence Search Engine
              </p>
            </div>
          </a>
        </div>
      </header>

      {/* Search section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Temukan Penelitian
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Cari publikasi akademik menggunakan fitur pencarian berbasis kecerdasan buatan.
            </p>
          </div>

          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={handleSearch}
          />
        </div>
      </section>

      {/* Results section */}
      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {!query ? (
          <div className="py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Mulai pencarianmu
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

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
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
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
          Footer
        </div>
      </footer>
    </main>
  );
}
