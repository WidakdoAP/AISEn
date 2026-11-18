import { apiClient } from "../../../app/api";
import type {
  SearchDocumentsParams,
  SearchRequestBody,
  SearchResponse,
} from "../types/search";

/** Path sesuai dokumentasi backend. */
const SEARCH_PATH = "/search";

/** Mengikuti contoh pada dokumentasi; selalu dikirim agar bebas default backend. */
const DEFAULT_MAX_THRESHOLD = 0.5;

/**
 * Cari dokumen berdasarkan kata kunci (`POST /search`).
 *
 * @returns `SearchResponse` — hasil pencarian ada di field `results`.
 * @throws {ApiError} dengan `message` yang aman ditampilkan ke pengguna.
 */
export function searchDocuments(
  params: SearchDocumentsParams
): Promise<SearchResponse> {
  const { signal, max_threshold, query } = params;

  const body: SearchRequestBody = {
    query,
    max_threshold: max_threshold ?? DEFAULT_MAX_THRESHOLD,
  };

  return apiClient.post<SearchResponse>(SEARCH_PATH, body, { signal });
}
