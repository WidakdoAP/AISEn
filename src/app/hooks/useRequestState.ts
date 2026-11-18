/**
 * Mengontrol state request dari lapisan UI. UI hanya membaca `state`
 * (discriminated union): idle | loading | success(data) | error(error).
 *
 * ```tsx
 * const { state } = useSearchDocuments(query);
 * if (state.status === "loading") return <Spinner />;
 * if (state.status === "error")   return <p>{state.error.message}</p>; // pesan sudah jelas
 * if (state.status === "success") return <List items={state.data} />;
 * return null; // idle
 * ```
 */

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { toApiError } from "../api/errors";
import { createIdleState, createLoadingState, requestReducer } from "../api/state";
import type { RequestState } from "../api/state";

export interface UseRequestStateOptions {
  /** Hanya jalankan request jika `true`. Default: `true`. */
  readonly enabled?: boolean;
  /**
   * Nilai yang berubah akan memicu request ulang
   * (berperan seperti dependency array, tanpa aturan lint exhaustiveness).
   * Contoh: `[queryTerpotong]`.
   */
  readonly key: readonly unknown[];
}

export interface UseRequestStateResult<T> {
  /** Discriminated union state request — narrowing dijamin TypeScript. */
  readonly state: RequestState<T>;
  /** Jalankan ulang request (mis. saat user menekan "coba lagi"). */
  readonly refetch: () => void;
  /** Kembalikan state ke `idle`. */
  readonly reset: () => void;
}

/**
 * Jalankan `executor` dan kontrol hasilnya lewat discriminated union.
 *
 * Jaminan:
 * - Executor lama selalu di-abort saat `key`/`enabled` berubah atau unmount.
 * - Respons basi (stale) diabaikan — tidak pernah menimpa state terbaru.
 * - Pembatalan (`abort`) TIDAK dianggap error.
 * - Error apa pun di-normalisasi menjadi `ApiError` dengan pesan jelas.
 */
export function useRequestState<T>(
  executor: (signal: AbortSignal) => Promise<T>,
  options: UseRequestStateOptions
): UseRequestStateResult<T> {
  const { enabled = true, key } = options;

  const [state, dispatch] = useReducer(
    requestReducer<T>,
    enabled,
    (isEnabled: boolean): RequestState<T> =>
      isEnabled ? createLoadingState<T>() : createIdleState<T>()
  );

  const [nonce, setNonce] = useState(0);

  // Simpan executor terbaru tanpa memicu request ulang saat identitas berubah.
  const executorRef = useRef(executor);
  useEffect(() => {
    executorRef.current = executor;
  });

  const refetch = useCallback(() => {
    setNonce((current) => current + 1);
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: "reset" });
      return;
    }

    const controller = new AbortController();
    let active = true;

    dispatch({ type: "start" });

    let promise: Promise<T>;
    try {
      promise = executorRef.current(controller.signal);
    } catch (error) {
      promise = Promise.reject(error);
    }

    promise
      .then((data) => {
        if (active) {
          dispatch({ type: "succeed", data });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        const apiError = toApiError(error);
        // Pembatalan (unmount/perubahan query) bukan kegagalan — jangan tampilkan.
        if (apiError.kind === "abort" || controller.signal.aborted) {
          return;
        }

        dispatch({ type: "fail", error: apiError });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // `key` adalah dependency eksplisit dari pemanggil; daftar panjangnya
    // dinamis sehingga aturan exhaustiveness lint tidak berlaku di sini.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...key]);

  return { state, refetch, reset };
}
