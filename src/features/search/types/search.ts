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
  /** Ambang batas skor minimum. */
  max_threshold: number;
}

/** Respons 200 `POST /search`. */
export interface SearchResponse {
  query: string;
  max_threshold: number;
  /** Jumlah hasil yang dikembalikan (sama dengan `results.length`). */
  count: number;
  results: SearchResult[];
}

export interface SearchDocumentsParams {
  query: string;
  /** Opsional — service mengirim default bila tidak diisi. */
  max_threshold?: number;
  /** Sinyal pembatalan — diteruskan dari hook UI. */
  signal?: AbortSignal;
}
