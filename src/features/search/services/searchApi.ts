import type { SearchResponse } from "../types/search";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function searchDocuments(
  query: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/search?${params.toString()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json() as Promise<SearchResponse>;
}