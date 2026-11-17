export interface SearchResult {
  peringkat: number;
  skor: number;
  judul: string;
  penulis: string;
  deskripsi: string;
  url: string;
  date: string;
}

export type SearchResponse = SearchResult[];