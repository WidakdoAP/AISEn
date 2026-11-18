import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  onClear: () => void;
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Cari penelitian, topik, atau penulis...",
}: SearchBarProps) {
  return (
    <form
      data-search-bar
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="academia-search"
    >
      <Search className="ml-3 h-5 w-5 shrink-0 text-[#85877f]" />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Kata kunci pencarian"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Hapus pencarian"
          className="rounded-lg p-2 text-[#85877f] hover:bg-[#eeece4]"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <button type="submit">
        Cari
      </button>
    </form>
  );
}
