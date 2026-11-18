/**
 * Base API client.
 *
 * Kontrak untuk konsumen: hanya pernah menghasilkan `T` atau melempar
 * `ApiError` — `Response` mentah tidak pernah bocor ke lapisan atas.
 */

import { serializeBody } from "./body";
import {
  ApiError,
  DEFAULT_USER_MESSAGES,
  describeError,
  isApiError,
  isNamedError,
} from "./errors";
import type { ApiErrorKind } from "./errors";
import {
  createAuthInterceptor,
  jsonHeadersInterceptor,
  unwrapEnvelopeInterceptor,
} from "./interceptors";
import type {
  ApiClientConfig,
  RequestContext,
  RequestOptions,
  RequestInterceptor,
  ResponseContext,
  ResponseInterceptor,
} from "./types";

const DEFAULT_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";
const DEFAULT_TIMEOUT_MS = 15_000;
const TOKEN_STORAGE_KEY = "access_token";
const MAX_ERROR_DETAIL_LENGTH = 500;

const JSON_CONTENT_TYPE = /json/i;

type ShortcutOptions = Omit<RequestOptions, "method" | "url" | "body">;

export interface ApiClient {
  /**
   * `T` adalah bentuk data SETELAH interceptor dijalankan
   * (mis. envelope `{ data }` sudah dibuka).
   */
  request<T>(options: RequestOptions): Promise<T>;
  get<T>(path: string, options?: ShortcutOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: ShortcutOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: ShortcutOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: ShortcutOptions): Promise<T>;
  delete<T>(path: string, options?: ShortcutOptions): Promise<T>;
}

export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  const baseUrl = normalizeBaseUrl(config.baseUrl ?? DEFAULT_BASE_URL);
  const defaultTimeoutMs = config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
  const getAccessToken = config.getAccessToken ?? readAccessTokenFromStorage;

  const requestInterceptors: readonly RequestInterceptor[] = [
    jsonHeadersInterceptor,
    createAuthInterceptor(getAccessToken),
    ...(config.requestInterceptors ?? []),
  ];

  const responseInterceptors: readonly ResponseInterceptor[] = [
    ...(config.enableEnvelopeUnwrap === false
      ? []
      : [unwrapEnvelopeInterceptor]),
    ...(config.responseInterceptors ?? []),
  ];

  async function request<T>(options: RequestOptions): Promise<T> {
    let intercepted: RequestOptions = options;
    for (const interceptor of requestInterceptors) {
      intercepted = await interceptor(intercepted);
    }

    const url = buildUrl(baseUrl, intercepted.url, intercepted.params);
    const context: RequestContext = {
      requestId: createRequestId(),
      method: intercepted.method,
      path: intercepted.url,
      startedAt: Date.now(),
    };

    const timeoutSignal = AbortSignal.timeout(
      intercepted.timeoutMs ?? defaultTimeoutMs
    );
    const signal = combineSignals([intercepted.signal, timeoutSignal]);

    let response: Response;
    try {
      response = await fetch(url, {
        method: intercepted.method,
        headers: intercepted.headers,
        body: buildRequestBody(intercepted),
        signal,
      });
    } catch (cause) {
      throw normalizeTransportError(cause, intercepted.signal, timeoutSignal);
    }

    if (response.ok === false) {
      throw await createHttpError(response, intercepted.signal, timeoutSignal);
    }

    let payload: unknown;
    try {
      payload = decodePayload(await response.text(), response.headers.get("content-type"));
    } catch (cause) {
      throw normalizeTransportError(cause, intercepted.signal, timeoutSignal);
    }

    const responseContext: ResponseContext = {
      ...context,
      url,
      status: response.status,
      headers: response.headers,
    };

    let result: unknown = payload;
    for (const interceptor of responseInterceptors) {
      result = await interceptor(result, responseContext);
    }

    return result as T;
  }

  const client: ApiClient = {
    request,
    get: (path, options) =>
      request({ ...options, method: "GET", url: path }),
    post: (path, body, options) =>
      request({ ...options, method: "POST", url: path, body }),
    put: (path, body, options) =>
      request({ ...options, method: "PUT", url: path, body }),
    patch: (path, body, options) =>
      request({ ...options, method: "PATCH", url: path, body }),
    delete: (path, options) =>
      request({ ...options, method: "DELETE", url: path }),
  };

  return client;
}

/** Instance client default yang dipakai seluruh fitur. */
export const apiClient: ApiClient = createApiClient();

export function combineSignals(signals: readonly (AbortSignal | undefined)[]): AbortSignal {
  const defined = signals.filter(
    (signal): signal is AbortSignal => signal !== undefined
  );

  if (defined.length === 0) {
    return new AbortController().signal;
  }
  if (defined.length === 1) {
    return defined[0] as AbortSignal;
  }
  return AbortSignal.any(defined);
}

export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl.replace(/\/+$/, "")}${normalizedPath}`;

  if (!params) {
    return url;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    search.append(key, String(value));
  }

  const query = search.toString();
  if (query.length === 0) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function readAccessTokenFromStorage(
  key: string = TOKEN_STORAGE_KEY
): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function buildRequestBody(options: RequestOptions): BodyInit | undefined {
  // fetch melarang body pada GET — buang agar tidak error.
  if (options.method === "GET") {
    return undefined;
  }
  return serializeBody(options.body);
}

function normalizeTransportError(
  cause: unknown,
  userSignal: AbortSignal | undefined,
  timeoutSignal: AbortSignal
): ApiError {
  // ApiError yang sudah jelas (mis. parse error) jangan dinormalisasi ulang.
  if (isApiError(cause)) {
    return cause;
  }

  if (userSignal?.aborted) {
    return new ApiError({
      kind: "abort",
      message: DEFAULT_USER_MESSAGES.abort,
      detail: describeError(cause),
      cause,
    });
  }

  if (timeoutSignal.aborted) {
    return new ApiError({
      kind: "timeout",
      message: DEFAULT_USER_MESSAGES.timeout,
      detail: describeError(cause),
      cause,
    });
  }

  if (isNamedError(cause, "AbortError")) {
    return new ApiError({
      kind: "abort",
      message: DEFAULT_USER_MESSAGES.abort,
      detail: describeError(cause),
      cause,
    });
  }

  if (cause instanceof TypeError) {
    return new ApiError({
      kind: "network",
      message: DEFAULT_USER_MESSAGES.network,
      detail: describeError(cause),
      cause,
    });
  }

  return new ApiError({
    kind: "unknown",
    message: DEFAULT_USER_MESSAGES.unknown,
    detail: describeError(cause),
    cause,
  });
}

/** Kosong → `undefined`, JSON valid → objek, selain itu teks. */
function decodePayload(text: string, contentType: string | null): unknown {
  if (text.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch (cause) {
    // Server menyatakan JSON tapi isinya rusak → ini kegagalan nyata.
    if (contentType !== null && JSON_CONTENT_TYPE.test(contentType)) {
      throw new ApiError({
        kind: "parse",
        message: DEFAULT_USER_MESSAGES.parse,
        detail: `Respons bukan JSON yang valid: ${truncate(text)}`,
        cause,
      });
    }

    // Content-type tidak jelas: kembalikan teks mentah apa adanya.
    return text;
  }
}

interface ParsedErrorBody {
  message?: string;
  code?: string;
  details?: unknown;
  detail?: string;
}

async function createHttpError(
  response: Response,
  userSignal: AbortSignal | undefined,
  timeoutSignal: AbortSignal
): Promise<ApiError> {
  const status = response.status;
  const kind = mapStatusToKind(status);

  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch (cause) {
    // Body error gagal dibaca: tetap lempar ApiError berdasarkan status saja.
    if (userSignal?.aborted || timeoutSignal.aborted || isNamedError(cause, "AbortError")) {
      throw normalizeTransportError(cause, userSignal, timeoutSignal);
    }
  }

  const parsed = parseErrorBody(bodyText);
  const detail = truncate(parsed.detail ?? bodyText) || undefined;

  return new ApiError({
    kind,
    message: resolveUserMessage(kind, parsed.message),
    detail,
    status,
    code: parsed.code,
    details: parsed.details,
  });
}

/**
 * `validation` memakai pesan server bila ada, diframe ulang agar jelas
 * (mis. "Permintaan tidak valid: query: Field required"); sisanya pesan default.
 */
function resolveUserMessage(kind: ApiErrorKind, serverMessage?: string): string {
  if (kind === "validation" && serverMessage && serverMessage.trim().length > 0) {
    return `Permintaan tidak valid: ${serverMessage.trim()}`;
  }
  return DEFAULT_USER_MESSAGES[kind];
}

function mapStatusToKind(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "unknown";
}

function parseErrorBody(text: string): ParsedErrorBody {
  if (text.trim().length === 0) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { detail: text };
    }

    const record = parsed as Record<string, unknown>;

    // Error validasi FastAPI: `detail` berupa array { loc, msg, ... }.
    if (Array.isArray(record.detail)) {
      const specifics = describeFastApiDetail(record.detail);
      return {
        message: specifics,
        details: record.detail,
        detail: specifics === undefined ? text : undefined,
      };
    }

    const message = firstString(record, ["message", "detail", "error", "title"]);
    const code = firstString(record, ["code", "errorCode"]);
    const details = record.errors ?? record.details ?? record.data;

    return {
      message,
      code,
      details,
      detail: message === undefined ? text : undefined,
    };
  } catch {
    return { detail: text };
  }
}

/** Ringkas `detail` FastAPI (array `{ loc, msg }`) jadi satu baris yang jelas. */
function describeFastApiDetail(detail: readonly unknown[]): string | undefined {
  const parts: string[] = [];

  for (const item of detail) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const record = item as Record<string, unknown>;
    if (typeof record.msg !== "string" || record.msg.trim().length === 0) {
      continue;
    }

    // `loc` biasanya ["body", "field"] — buang prefix "body".
    const locParts = Array.isArray(record.loc)
      ? record.loc.filter((part) => part !== "body").map(String)
      : [];
    const field = locParts.length > 0 ? locParts.join(".") : undefined;

    parts.push(field === undefined ? record.msg : `${field}: ${record.msg}`);
  }

  return parts.length > 0 ? parts.join("; ") : undefined;
}

function firstString(
  record: Record<string, unknown>,
  keys: readonly string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function truncate(text: string, maxLength: number = MAX_ERROR_DETAIL_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
}
