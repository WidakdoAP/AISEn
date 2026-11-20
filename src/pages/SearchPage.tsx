import { Fragment, useEffect, useState, useRef, type ReactNode } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import SearchBar from "../features/search/components/SearchBar";
import SearchResults from "../features/search/components/SearchResults";
import { useSearchDocuments } from "../features/search/hooks/useSearchDocuments";

function getJournalYearRange(results: { date: string | null | undefined }[]): string | null {
  const years = results
    .map((result) => result.date?.match(/^(\d{4})(?:-\d{1,2}){0,2}$/)?.[1])
    .filter((year): year is string => year !== undefined)
    .map(Number)
    .filter((year) => year >= 1000 && year <= 9999);

  if (years.length === 0) {
    return null;
  }

  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  return firstYear === lastYear ? String(firstYear) : `${firstYear}–${lastYear}`;
}

function renderSummaryText(
  text: string,
  onCitationClick: (rank: number) => void
): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+(?:\s*,\s*\d+)*\])/)
    .map((part, index) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      if (/^\*[^*]+\*$/.test(part)) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }

      const citation = /^\[(\d+(?:\s*,\s*\d+)*)\]$/.exec(part);

      if (citation) {
        const ranks = citation[1].split(",").map((rank) => Number(rank.trim()));

        return (
          <Fragment key={index}>
            {ranks.map((rank, rankIndex) => (
              <Fragment key={rank}>
                {rankIndex > 0 && " "}
                <button
                  type="button"
                  className="academia-ai-citation"
                  onClick={() => onCitationClick(rank)}
                  aria-label={`Buka dokumen ${rank}`}
                >
                  [{rank}]
                </button>
              </Fragment>
            ))}
          </Fragment>
        );
      }

      return <Fragment key={index}>{part}</Fragment>;
    });
}

function scrollToDocument(rank: number) {
  const target = document.getElementById(`document-${rank}`);

  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  target?.focus({ preventScroll: true });
}

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
  const [page, setPage] = useState(1);
  const [relevance, setRelevance] = useState(0.5);
  const [debouncedRelevance, setDebouncedRelevance] = useState(0.5);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const optionsRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const [pendingCitation, setPendingCitation] = useState<number | null>(null);
  const resultsPerPage = 10;

  const { state } = useSearchDocuments(query, debouncedRelevance);
  const loading = state.status === "loading";
  const error = state.status === "error" ? state.error.message : null;
  const response = state.status === "success" ? state.data : null;
  const results = response?.results ?? [];
  const journalYearRange = getJournalYearRange(results);
  const totalPages = Math.max(1, Math.ceil(results.length / resultsPerPage));
  const pageStart = (page - 1) * resultsPerPage;
  const paginatedResults = results.slice(pageStart, pageStart + resultsPerPage);

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
    const timeoutId = window.setTimeout(() => {
      setDebouncedRelevance(relevance);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [relevance]);

  useEffect(() => {
    if (pendingCitation === null) {
      return;
    }

    scrollToDocument(pendingCitation);
  }, [pendingCitation, page]);

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


  const summarySections = response?.ringkasan
    ?.split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean) ?? [];

  function handleCitationClick(rank: number) {
    const targetPage = Math.ceil(rank / resultsPerPage);

    if (targetPage === page) {
      scrollToDocument(rank);
      return;
    }

    setPendingCitation(rank);
    setPage(targetPage);
  }

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
                    <p className="mb-3 text-sm font-semibold text-[#243746]">
                      Relevansi data
                    </p>

                    <div className="academia-relevance-options" role="group" aria-label="Relevansi data">
                      <button
                        type="button"
                        onClick={() => setRelevance(0.4)}
                        aria-pressed={relevance === 0.4}
                        className={relevance === 0.4 ? "is-active" : ""}
                      >
                        Lemah
                      </button>
                      <button
                        type="button"
                        onClick={() => setRelevance(0.5)}
                        aria-pressed={relevance === 0.5}
                        className={relevance === 0.5 ? "is-active" : ""}
                      >
                        Sedang
                      </button>
                      <button
                        type="button"
                        onClick={() => setRelevance(0.6)}
                        aria-pressed={relevance === 0.6}
                        className={relevance === 0.6 ? "is-active" : ""}
                      >
                        Tinggi
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-[#85877f]">
                      Hasil diperbarui otomatis saat relevansi diubah.
                    </p>
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

          {response?.status === "full" && response.ringkasan && (
            <section className="academia-ai-summary mt-6 -mb-8" aria-labelledby="ai-summary-title">
              <div className="academia-ai-summary-header">
                <div className="academia-ai-icon">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="academia-ai-eyebrow">AI overview</p>
                  <h3 id="ai-summary-title">Ringkasan penelitian</h3>
                  <p>
                    Berdasarkan {Math.min(results.length, 5)} jurnal paling relevan
                    {journalYearRange ? ` · ${journalYearRange}` : ""}
                  </p>
                </div>
              </div>

              <div className="academia-ai-summary-content">
                {summarySections.map((section, index) => (
                  <p key={`${index}-${section.slice(0, 24)}`}>
                    {renderSummaryText(section, handleCitationClick)}
                  </p>
                ))}
              </div>

              <div className="academia-ai-footer">
                <span className="academia-ai-source-dot" aria-hidden="true" />
                Referensi [n] merujuk ke nomor dokumen pada hasil pencarian.
              </div>
            </section>
          )}

          {response?.status === "list_only" && response.ringkasan_error && (
            <div className="academia-ai-notice mt-6" role="status">
              Ringkasan AI belum tersedia: {response.ringkasan_error}
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
                  {response?.arahan?.join(" ") || "Coba gunakan kata kunci atau deskripsi yang berbeda."}
                </p>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <>
                <SearchResults results={paginatedResults} />

                {totalPages > 1 && (
                  <nav
                    className="academia-pagination mt-8"
                    aria-label="Halaman hasil pencarian"
                  >
                    <p className="academia-pagination-summary">
                      Menampilkan {pageStart + 1}–{Math.min(pageStart + resultsPerPage, results.length)} dari {results.length} dokumen
                    </p>

                    <div className="academia-pagination-controls">
                      <button
                        type="button"
                        onClick={() => setPage((currentPage) => currentPage - 1)}
                        disabled={page === 1}
                        aria-label="Halaman sebelumnya"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Sebelumnya</span>
                      </button>

                      <span className="academia-pagination-page" aria-current="page">
                        {page} / {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() => setPage((currentPage) => currentPage + 1)}
                        disabled={page === totalPages}
                        aria-label="Halaman berikutnya"
                      >
                        <span>Berikutnya</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </nav>
                )}
              </>
              )}
          </>
        )}
      </section>


    </main>
  );
}
