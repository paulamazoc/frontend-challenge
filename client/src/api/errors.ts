import type { ApiErrorBody } from '@/domain/api-types';

type ServerErrorCode = ApiErrorBody['error']['code'];

/**
 * Every server code, plus the two failures the client detects on its own:
 * `NETWORK_ERROR` when the request never completed, and `INVALID_RESPONSE` when
 * a response arrived but did not match the contract the caller depends on.
 */
export type ApiErrorCode = ServerErrorCode | 'NETWORK_ERROR' | 'INVALID_RESPONSE';

export type ApiErrorDetail = NonNullable<ApiErrorBody['error']['details']>[number];

interface ApiErrorInit {
  code: ApiErrorCode;
  message: string;
  /** `null` when no response was received, or when the client rejected the body. */
  status?: number | null;
  details?: ApiErrorDetail[];
  cause?: unknown;
}

/** The single failure type the rest of the app has to handle. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly details: ApiErrorDetail[];

  constructor({ code, message, status = null, details = [], cause }: ApiErrorInit) {
    super(message, { cause });
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
