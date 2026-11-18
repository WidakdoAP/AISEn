/**
 * Urutan interceptor di `createApiClient`:
 *   request  → jsonHeaders → auth → custom
 *   response → unwrapEnvelope → custom
 */

import { isExplicitBodyInit } from "./body";
import type {
  RequestInterceptor,
  ResponseInterceptor,
} from "./types";

export const jsonHeadersInterceptor: RequestInterceptor = (options) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  const hasBody =
    options.body !== undefined &&
    options.body !== null &&
    options.method !== "GET";

  const hasContentType = Object.keys(headers).some(
    (name) => name.toLowerCase() === "content-type"
  );

  // Hanya set Content-Type JSON untuk object yang akan di-JSON.stringify.
  if (hasContentType === false && hasBody && isExplicitBodyInit(options.body) === false) {
    headers["Content-Type"] = "application/json";
  }

  return { ...options, headers };
};

/** Sisipkan `Authorization: Bearer <token>` dari `getAccessToken` bila tersedia. */
export function createAuthInterceptor(
  getAccessToken: () => string | null | undefined
): RequestInterceptor {
  return (options) => {
    const token = getAccessToken();
    if (!token) {
      return options;
    }

    const hasAuthorization = Object.keys(options.headers ?? {}).some(
      (name) => name.toLowerCase() === "authorization"
    );
    if (hasAuthorization) {
      return options;
    }

    return {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    };
  };
}

/** Bentuk envelope yang didukung: `{ data, message?, code?, success? }`. */
export interface ApiEnvelope<T = unknown> {
  readonly data?: T;
  readonly message?: string;
  readonly code?: string;
  readonly success?: boolean;
}

/** Object dengan field `data` dianggap envelope; array dan object biasa bukan. */
export function isApiEnvelope(payload: unknown): payload is ApiEnvelope {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return false;
  }

  const record = payload as Record<string, unknown>;
  if ("data" in record === false) {
    return false;
  }

  return "message" in record || "code" in record || "success" in record;
}

/**
 * Buka envelope agar konsumen selalu menerima `T`, bukan `{ data: T }`.
 * Nonaktifkan lewat `enableEnvelopeUnwrap` di `ApiClientConfig`.
 */
export const unwrapEnvelopeInterceptor: ResponseInterceptor = (payload) =>
  isApiEnvelope(payload) ? payload.data : payload;

export interface NetworkLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/** Logger request/response untuk debugging jaringan. */
export function createLoggingInterceptor(logger: NetworkLogger = console): {
  request: RequestInterceptor;
  response: ResponseInterceptor;
} {
  return {
    request: (options) => {
      logger.debug(`[api] → ${options.method} ${options.url}`);
      return options;
    },
    response: (payload, context) => {
      const duration = Date.now() - context.startedAt;
      logger.debug(
        `[api] ← ${context.status} ${context.method} ${context.path} (${duration}ms, ${context.requestId})`
      );
      return payload;
    },
  };
}
