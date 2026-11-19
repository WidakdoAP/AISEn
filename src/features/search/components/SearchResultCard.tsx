import { ExternalLink, FileText } from "lucide-react";
import type { SearchResult } from "../types/search";

interface SearchResultCardProps {
  result: SearchResult;
}

export default function SearchResultCard({
  result,
}: SearchResultCardProps) {
  const title = result.judul?.trim() || "Judul tidak tersedia";
  const authors = result.penulis?.trim() || "Penulis tidak tersedia";
  const description = result.deskripsi?.trim() || "Deskripsi tidak tersedia";
  const date = result.date?.trim() || "Tanggal tidak tersedia";
  const url = result.url?.trim();
  const hasPublicationUrl = Boolean(url && /^https?:\/\//i.test(url));
  const matchPercentage = Number.isFinite(result.skor)
    ? Math.round(Math.max(0, Math.min(100, result.skor * 100)))
    : null;

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

        {matchPercentage !== null && (
          <span className="academia-score">
            Kecocokan {matchPercentage}%
          </span>
        )}
      </div>

      <h2 className="academia-result-title mt-5">
        {title}
      </h2>

      <div className="academia-result-meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{authors}</span>
        <span className="text-[#b18b50]">•</span>
        <span>{date}</span>
      </div>

      <p className="academia-result-description mt-5 line-clamp-4">
        {description}
      </p>

      <div className="mt-5 border-t border-[#e5e0d4] pt-4">
        {hasPublicationUrl ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="academia-link"
          >
            Baca publikasi
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-sm text-[#85877f]">URL publikasi tidak tersedia</span>
        )}
      </div>
    </article>
  );
}
