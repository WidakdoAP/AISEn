import { ExternalLink, FileText } from "lucide-react";
import type { SearchResult } from "../types/search";

interface SearchResultCardProps {
  result: SearchResult;
}

export default function SearchResultCard({
  result,
}: SearchResultCardProps) {
  return (
    <article className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500">
          <FileText className="h-4 w-4 shrink-0 text-blue-700" />
          <span>Dokumen #{result.peringkat}</span>
        </div>

        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Skor: {result.skor.toFixed(4)}
        </span>
      </div>

      <h2 className="mt-4 text-base font-semibold leading-relaxed text-slate-900 transition group-hover:text-blue-700 sm:text-lg">
        {result.judul}
      </h2>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        <span>{result.penulis}</span>
        <span className="hidden sm:inline">•</span>
        <span>{result.date || "Tanggal tidak tersedia"}</span>
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-600">
        {result.deskripsi}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Lihat dokumen
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}