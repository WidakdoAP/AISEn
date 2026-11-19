/**
 * Kontrak data untuk fitur pencarian.
 *
 * Sumber: dokumentasi resmi backend (FastAPI + ChromaDB), endpoint `POST /search`.
 * Field mengikuti wire format backend (snake_case) apa adanya.
 */

export interface SearchResult {
  /** Posisi dokumen dalam hasil pencarian (mulai dari 1). */
  peringkat: number;
  /** Skor relevansi terhadap kata kunci. */
  skor: number;
  judul: string;
  penulis: string;
  deskripsi: string;
  /** Tautan menuju sumber dokumen. */
  url: string;
  /** Tanggal publikasi (string, format menyerahkan backend). */
  date: string;
}

/** Body request `POST /search`. */
export interface SearchRequestBody {
  query: string;
  max_threshold: number;
}

export type SearchStatus = "full" | "list_only" | "no_results";

/** Respons 200 `POST /search`. */
export interface SearchResponse {
  query: string;
  max_threshold: number;
  count: number;
  results: SearchResult[];
  status: SearchStatus;
  ringkasan: string | null;
  ringkasan_error: string | null;
  arahan: string[];
}

export interface SearchDocumentsParams {
  query: string;
  threshold?: number;
  signal?: AbortSignal;
}
