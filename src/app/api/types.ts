export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** `null`/`undefined`/`""` akan dilewati (tidak dikirim ke server). */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  /** Path relatif terhadap base URL, contoh: `"/search"`. */
  readonly url: string;
  readonly method: HttpMethod;
  readonly params?: QueryParams;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
  /** Sinyal pembatalan dari pemanggil (mis. dari hook UI). */
  readonly signal?: AbortSignal;
  /** Timeout khusus request ini dalam milidetik. Default: 15000. */
  readonly timeoutMs?: number;
}

/**
 * Interceptor request: menerima opsi request, mengembalikan opsi baru.
 * Berjalan berurutan sesuai urutan deklarasi.
 */
export type RequestInterceptor = (
  options: RequestOptions
) => RequestOptions | Promise<RequestOptions>;

export interface RequestContext {
  /** ID unik request, dipakai untuk logging/tracing. */
  readonly requestId: string;
  readonly method: HttpMethod;
  readonly path: string;
  readonly startedAt: number;
}

export interface ResponseContext extends RequestContext {
  /** URL lengkap yang dipanggil (baseUrl + path + query). */
  readonly url: string;
  readonly status: number;
  readonly headers: Headers;
}

/**
 * Interceptor response: menerima payload yang sudah di-decode (JSON/teks),
 * mengembalikan payload baru. Berjalan berurutan sesuai urutan deklarasi.
 */
export type ResponseInterceptor = (
  payload: unknown,
  context: ResponseContext
) => unknown | Promise<unknown>;

export interface ApiClientConfig {
  /** Default: `import.meta.env.VITE_API_BASE_URL`. */
  readonly baseUrl?: string;
  /** Default timeout dalam ms. Default: 15000. */
  readonly defaultTimeoutMs?: number;
  /**
   * Pengambil token auth untuk header `Authorization`.
   * Default: membaca `localStorage["access_token"]`.
   * Kirim `() => null` untuk menonaktifkan penuh.
   */
  readonly getAccessToken?: () => string | null | undefined;
  /** Aktifkan pembungkusan envelope `{ data, message, code }`. Default: `true`. */
  readonly enableEnvelopeUnwrap?: boolean;
  readonly requestInterceptors?: readonly RequestInterceptor[];
  readonly responseInterceptors?: readonly ResponseInterceptor[];
}
