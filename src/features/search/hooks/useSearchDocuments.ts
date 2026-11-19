/**
 * Untuk UI: pakai hook ini lalu baca `state` —
 * idle | loading | success(SearchResponse) | error(ApiError).
 * Hasil pencarian ada di `state.data.results`.
 *
 * - Query kosong → state `idle`, tidak ada request dikirim.
 * - Query berubah → request sebelumnya otomatis di-abort (tanpa error).
 */

import { useRequestState } from "../../../app/hooks/useRequestState";
import type { UseRequestStateResult } from "../../../app/hooks/useRequestState";
import { searchDocuments } from "../services/searchApi";
import type { SearchResponse } from "../types/search";

export function useSearchDocuments(
  query: string,
  threshold?: number
): UseRequestStateResult<SearchResponse> {
  const trimmedQuery = query.trim();

  return useRequestState<SearchResponse>(
    (signal) =>
      searchDocuments({ query: trimmedQuery, threshold, signal }),
    { enabled: trimmedQuery.length > 0, key: [trimmedQuery, threshold] }
  );
}
