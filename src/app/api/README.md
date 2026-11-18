# Network Layer (`src/app`)

Lapisan jaringan untuk AISEn. **Dikelola developer network** — developer UI cukup
mengonsumsi hook, tanpa menyentuh `fetch`, URL, header, maupun error handling.

> Status kontrak API: endpoint `POST /search` (FastAPI + ChromaDB) sudah
> berdasarkan dokumentasi resmi. Endpoint lain masih **sementara** — menunggu
> dokumentasi backend; perbarui hanya `src/features/<fitur>/types/*.ts`.

## Struktur

```
src/app/
├── api/
│   ├── types.ts         # Tipe dasar (RequestOptions, interceptor, config)
│   ├── body.ts          # Serialisasi body (JSON vs FormData)
│   ├── errors.ts        # ApiError + pesan yang jelas untuk user
│   ├── state.ts         # Discriminated union state + reducer
│   ├── interceptors.ts  # Interceptor bawaan (header, auth, envelope, logger)
│   ├── client.ts        # Base API client (fetch, timeout, abort, normalisasi error)
│   └── index.ts         # ← import publik ada di sini
└── hooks/
    ├── useRequestState.ts  # Hook generik state request
    └── index.ts
```

## Cara developer UI memakai hook

```tsx
const { state, refetch, reset } = useSearchDocuments(query);

switch (state.status) {
  case "idle":    return null;
  case "loading": return <Spinner />;
  case "error":   return <p>{state.error.message}</p>; // pesan sudah jelas & aman
  case "success": return <List items={state.data} />;
}
```

- `state.error.message` **selalu** aman ditampilkan ke pengguna.
- `state.error.detail` / `.status` / `.code` hanya untuk debugging.
- `refetch()` untuk tombol "coba lagi", `reset()` untuk kembali ke `idle`.

## Cara developer network menambah endpoint

```ts
// 1. Definisikan kontrak di features/<fitur>/types/*.ts
export interface ProfileResponse { nama: string; }

// 2. Buat consumer di features/<fitur>/services/*Api.ts
import { apiClient } from "../../../app/api";

export const getProfile = () => apiClient.get<ProfileResponse>("/api/v1/profile");
```

`apiClient` sudah menangani: baseUrl (`VITE_API_BASE_URL`), header JSON,
token `Authorization` (dari `localStorage["access_token"]`), timeout 15 detik,
query parameter, unwrap envelope `{ data, message, code }`, dan normalisasi
semua error menjadi `ApiError` ber-pesan jelas.

## Jenis error (`ApiErrorKind`)

| kind | arti |
|---|---|
| `network` | Gagal terhubung (offline/DNS/CORS) |
| `timeout` | Server tidak merespons dalam 15 detik |
| `abort` | Dibatalkan (bukan kegagalan; hook mengabaikannya) |
| `unauthorized` / `forbidden` | 401 / 403 |
| `notFound` | 404 |
| `validation` | 400 / 422 (memakai pesan server bila ada) |
| `server` | 5xx |
| `client` | 4xx lainnya |
| `parse` | Respons bukan JSON yang valid |
| `unknown` | Lainnya |

## Interceptor

Urutan: request → `jsonHeaders` → `auth` → custom; response → `unwrapEnvelope` → custom.

```ts
const log = createLoggingInterceptor();
const api = createApiClient({
  requestInterceptors: [log.request],
  responseInterceptors: [log.response],
  enableEnvelopeUnwrap: true, // matikan jika backend tidak pakai envelope
});
```
