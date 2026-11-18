/** Import seluruh lapisan jaringan dari sini, bukan path internal. */

export { apiClient, createApiClient, buildUrl, combineSignals, readAccessTokenFromStorage } from "./client";
export type { ApiClient } from "./client";

export {
  ApiError,
  DEFAULT_USER_MESSAGES,
  describeError,
  getErrorMessage,
  isApiError,
  isNamedError,
  toApiError,
} from "./errors";
export type { ApiErrorInit, ApiErrorKind } from "./errors";

export {
  createErrorState,
  createIdleState,
  createLoadingState,
  createSuccessState,
  isErrorState,
  isIdleState,
  isLoadingState,
  isSuccessState,
  matchRequestState,
  requestReducer,
} from "./state";
export type {
  ErrorState,
  IdleState,
  LoadingState,
  RequestAction,
  RequestState,
  RequestStateMatchers,
  SuccessState,
} from "./state";

export {
  createAuthInterceptor,
  createLoggingInterceptor,
  isApiEnvelope,
  jsonHeadersInterceptor,
  unwrapEnvelopeInterceptor,
} from "./interceptors";
export type { ApiEnvelope, NetworkLogger } from "./interceptors";

export type {
  ApiClientConfig,
  HttpMethod,
  QueryParams,
  RequestContext,
  RequestOptions,
  RequestInterceptor,
  ResponseContext,
  ResponseInterceptor,
} from "./types";
