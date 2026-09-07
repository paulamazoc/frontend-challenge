import { ApiError, type ApiErrorCode, type ApiErrorDetail } from './errors';
import { isRecord } from './guards';

const API_BASE_URL = '/api';

/**
 * Executes a request and returns the parsed JSON body as `unknown`.
 *
 * This is the transport layer and nothing more: it reaches the API, reads a
 * body, and turns any failure into an `ApiError`. It deliberately does not know
 * what a successful payload looks like — records come back under `{ data }`,
 * but reports and projections return their own top-level shapes. Deciding what
 * a given endpoint must return is the job of the module that owns that
 * endpoint, which is why the return type is `unknown`.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    });
  } catch (cause) {
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Could not reach the server. Check your connection and try again.',
      cause,
    });
  }

  let text: string;

  try {
    text = await response.text();
  } catch (cause) {
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'The connection dropped before the server finished responding.',
      status: response.status,
      cause,
    });
  }

  let body: unknown;
  let isJson = true;

  try {
    body = JSON.parse(text) as unknown;
  } catch {
    isJson = false;
  }

  if (!response.ok) {
    throw toApiError(response.status, isJson ? body : undefined);
  }

  if (!isJson) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: `The server returned a body that is not JSON for ${path}.`,
      status: response.status,
    });
  }

  return body;
}

/** Every failure shares one envelope: `{ error: { code, message, details? } }`. */
function toApiError(status: number, body: unknown): ApiError {
  const envelope = isRecord(body) && isRecord(body.error) ? body.error : null;
  const code = envelope?.code;
  const message = envelope?.message;
  const details = envelope?.details;

  if (typeof code !== 'string' || typeof message !== 'string') {
    return new ApiError({
      code: 'INVALID_RESPONSE',
      message: `The server responded with ${status} but no readable error details.`,
      status,
    });
  }

  return new ApiError({
    code: code as ApiErrorCode,
    message,
    status,
    details: Array.isArray(details) ? (details as ApiErrorDetail[]) : [],
  });
}
