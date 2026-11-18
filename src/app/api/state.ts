/**
 * Discriminated union untuk mengontrol state async (request).
 *
 * Transisi state:
 *
 *   idle ──start──▶ loading ──succeed──▶ success(data)
 *     ▲                │                    │
 *     │                └──fail──▶ error ─────┘ (refetch → start)
 *     └────────────── reset ──────────────────┘
 *
 * Karena state adalah discriminated union, pemakaian `switch (state.status)`
 * di UI dijamin exhaustiveness oleh TypeScript — menambah varian baru akan
 * langsung error di semua konsumen yang belum ditangani.
 */

import type { ApiError } from "./errors";

export interface IdleState {
  readonly status: "idle";
}

export interface LoadingState {
  readonly status: "loading";
}

export interface SuccessState<T> {
  readonly status: "success";
  readonly data: T;
}

export interface ErrorState {
  readonly status: "error";
  readonly error: ApiError;
}

export type RequestState<T> =
  | IdleState
  | LoadingState
  | SuccessState<T>
  | ErrorState;

/** Aksi yang memicu transisi state — juga discriminated union. */
export type RequestAction<T> =
  | { readonly type: "start" }
  | { readonly type: "succeed"; readonly data: T }
  | { readonly type: "fail"; readonly error: ApiError }
  | { readonly type: "reset" };

export function createIdleState<T>(): RequestState<T> {
  return { status: "idle" };
}

export function createLoadingState<T>(): RequestState<T> {
  return { status: "loading" };
}

export function createSuccessState<T>(data: T): RequestState<T> {
  return { status: "success", data };
}

export function createErrorState<T>(error: ApiError): RequestState<T> {
  return { status: "error", error };
}

/**
 * Reducer tunggal untuk seluruh transisi state request.
 * `start` saat sudah loading tidak menghasilkan objek baru (hindari re-render sia-sia).
 */
export function requestReducer<T>(
  state: RequestState<T>,
  action: RequestAction<T>
): RequestState<T> {
  switch (action.type) {
    case "start":
      return state.status === "loading" ? state : { status: "loading" };
    case "succeed":
      return { status: "success", data: action.data };
    case "fail":
      return { status: "error", error: action.error };
    case "reset":
      return state.status === "idle" ? state : { status: "idle" };
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

export function isIdleState<T>(state: RequestState<T>): state is IdleState {
  return state.status === "idle";
}

export function isLoadingState<T>(state: RequestState<T>): state is LoadingState {
  return state.status === "loading";
}

export function isSuccessState<T>(
  state: RequestState<T>
): state is SuccessState<T> {
  return state.status === "success";
}

export function isErrorState<T>(
  state: RequestState<T>
): state is ErrorState {
  return state.status === "error";
}

export interface RequestStateMatchers<T, R> {
  idle: () => R;
  loading: () => R;
  success: (data: T) => R;
  error: (error: ApiError) => R;
}

/**
 * Render state secara exhaustiveness tanpa `switch` manual.
 * Contoh: `matchRequestState(state, { idle: () => null, ... })`
 */
export function matchRequestState<T, R>(
  state: RequestState<T>,
  matchers: RequestStateMatchers<T, R>
): R {
  switch (state.status) {
    case "idle":
      return matchers.idle();
    case "loading":
      return matchers.loading();
    case "success":
      return matchers.success(state.data);
    case "error":
      return matchers.error(state.error);
    default: {
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
    }
  }
}
