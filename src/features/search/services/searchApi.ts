import type { SearchResponse } from "../types/search";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function searchDocuments(
  query: string,
  maxThreshold: number,
  signal?: AbortSignal
): Promise<SearchResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        max_threshold: maxThreshold,
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new Error("Tidak dapat terhubung ke server pencarian.");
  }

  if (!response.ok) {
    let message = "Pencarian gagal. Coba lagi nanti.";

    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        message = body.detail;
      }
    } catch {
      message = `Pencarian gagal (${response.status}).`;
    }

    throw new Error(message);
  }

  try {
    return (await response.json()) as SearchResponse;
  } catch {
    throw new Error("Server mengirim respons pencarian yang tidak valid.");
  }
}
