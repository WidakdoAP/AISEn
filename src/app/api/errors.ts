/**
 * Semua kegagalan jaringan dinormalisasi menjadi `ApiError`.
 * `message` aman ditampilkan ke pengguna; `detail`/`code`/`status` hanya untuk debugging.
 */

export type ApiErrorKind =
  /** Gagal terhubung ke server (offline, DNS, CORS, dsb.). */
  | "network"
  /** Server tidak merespons dalam batas waktu. */
  | "timeout"
  /** Request dibatalkan (unmount, perubahan query, dsb.). Bukan kegagalan. */
  | "abort"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  /** Request ditolak karena input tidak valid (400/422). */
  | "validation"
  /** Kegagalan di sisi server (5xx). */
  | "server"
  /** Kegagalan sisi client lainnya (4xx yang tidak tercakup di atas). */
  | "client"
  /** Respons server tidak dapat di-decode. */
  | "parse"
  | "unknown";

export interface ApiErrorInit {
  readonly kind: ApiErrorKind;
  /** Pesan yang AMAN ditampilkan ke pengguna (bahasa Indonesia, jelas). */
  readonly message: string;
  /** Pesan teknis untuk debugging. */
  readonly detail?: string;
  readonly status?: number;
  /** Kode error dari server, jika ada (mis. `"VALIDATION_ERROR"`). */
  readonly code?: string;
  /** Body error mentah dari server. */
  readonly details?: unknown;
  readonly cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly detail: string | undefined;
  readonly code: string | undefined;
  readonly details: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = "ApiError";
    this.kind = init.kind;
    this.status = init.status;
    this.detail = init.detail;
    this.code = init.code;
    this.details = init.details;
  }

  /** True jika ini hanya pembatalan request, bukan kegagalan nyata. */
  get isAbort(): boolean {
    return this.kind === "abort";
  }
}

export const DEFAULT_USER_MESSAGES: Record<ApiErrorKind, string> = {
  network:
    "Tidak dapat terhubung ke server. Periksa koneksi internetmu, lalu coba lagi.",
  timeout: "Server terlalu lama merespons. Coba lagi beberapa saat lagi.",
  abort: "Permintaan dibatalkan.",
  unauthorized: "Sesi kamu telah berakhir. Silakan masuk kembali untuk melanjutkan.",
  forbidden: "Kamu tidak memiliki akses untuk melihat data ini.",
  notFound: "Data yang diminta tidak ditemukan.",
  validation:
    "Permintaan tidak valid. Periksa kembali inputmu, lalu coba lagi.",
  server: "Server sedang mengalami gangguan. Coba lagi beberapa saat lagi.",
  client: "Permintaan gagal diproses. Coba lagi beberapa saat lagi.",
  parse: "Respons dari server tidak dapat diproses. Coba lagi nanti.",
  unknown: "Terjadi kesalahan yang tidak terduga. Coba lagi nanti.",
};

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** True jika objek error memiliki `name` tertentu (mis. `"AbortError"`). */
export function isNamedError(value: unknown, name: string): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    (value as { name: unknown }).name === name
  );
}

export function describeError(value: unknown): string {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }
  if (value === undefined || value === null) {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Ubah error apa pun menjadi `ApiError`.
 * Dipakai sebagai jaring pengaman di ujung setiap request dan di hook UI.
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (isNamedError(error, "AbortError")) {
    return new ApiError({
      kind: "abort",
      message: DEFAULT_USER_MESSAGES.abort,
      detail: describeError(error),
      cause: error,
    });
  }

  // `TypeError` dari `fetch` hampir selalu berarti kegagalan koneksi.
  if (error instanceof TypeError) {
    return new ApiError({
      kind: "network",
      message: DEFAULT_USER_MESSAGES.network,
      detail: describeError(error),
      cause: error,
    });
  }

  return new ApiError({
    kind: "unknown",
    message: DEFAULT_USER_MESSAGES.unknown,
    detail: describeError(error),
    cause: error,
  });
}

/** Ambil pesan yang aman ditampilkan dari error apa pun. */
export function getErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_USER_MESSAGES.unknown
): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}
