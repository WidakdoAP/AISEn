import { ExternalLink, FileText } from "lucide-react";
import type { SearchResult } from "../types/search";

interface SearchResultCardProps {
  result: SearchResult;
}

export default function SearchResultCard({
  result,
}: SearchResultCardProps) {
  return (
    <article
      data-result-card
      className="academia-result group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#85877f]">
          <FileText className="h-4 w-4 shrink-0 text-[#b18b50]" />
          <span>Dokumen #{result.peringkat}</span>
        </div>

        <span className="academia-score">
          Relevansi {result.skor.toFixed(4)}
        </span>
      </div>

      <h2 className="academia-result-title mt-5">
        {result.judul}
      </h2>

      <div className="academia-result-meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{result.penulis}</span>
        <span className="text-[#b18b50]">•</span>
        <span>{result.date || "Tanggal tidak tersedia"}</span>
      </div>

      <p className="academia-result-description mt-5 line-clamp-4">
        {result.deskripsi}
      </p>

      <div className="mt-5 border-t border-[#e5e0d4] pt-4">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="academia-link"
        >
          Baca publikasi
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
