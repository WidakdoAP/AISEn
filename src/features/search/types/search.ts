export interface SearchResult {
  peringkat: number;
  skor: number;
  judul: string;
  penulis: string;
  deskripsi: string;
  url: string;
  date: string;
}

export interface SearchResponse {
  query: string;
  max_threshold: number;
  count: number;
  results: SearchResult[];
}
