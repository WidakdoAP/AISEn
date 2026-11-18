import { apiClient } from "../../../app/api";
import type {
  SearchDocumentsParams,
  SearchRequestBody,
  SearchResponse,
} from "../types/search";

const SEARCH_PATH = "/search";
const DEFAULT_MAX_THRESHOLD = 0.5;

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
