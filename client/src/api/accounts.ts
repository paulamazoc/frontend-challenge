import type { AccountsListMeta, AccountWithBalance } from '@/domain/accounts';
import type { Collection, IsoDate } from '@/domain/api-types';
import { apiFetch } from './client';
import { ApiError } from './errors';
import { isRecord } from './guards';

export type AccountsResponse = Collection<AccountWithBalance, AccountsListMeta>;

export interface FetchAccountsParams {
  asOf?: IsoDate;
}

/**
 * `includeBalances=true` is already the endpoint's default, but it is stated
 * explicitly because the `AccountWithBalance` narrowing below depends on it. An
 * assumption the client relies on should be visible in the request, not
 * inherited silently from a server default that could change.
 */
export async function fetchAccounts(
  params: FetchAccountsParams = {},
  signal?: AbortSignal,
): Promise<AccountsResponse> {
  const query = new URLSearchParams({ includeBalances: 'true' });

  if (params.asOf !== undefined) {
    query.set('asOf', params.asOf);
  }

  const body = await apiFetch(`/accounts?${query.toString()}`, { signal });

  assertAccountsResponse(body);

  return body;
}

/**
 * Checks only what this screen actually depends on: a `data` array, the `asOf`
 * date, and a balance on every account. Field-level shapes inside each account
 * are trusted rather than schema-validated — the goal is to fail loudly on a
 * broken contract, not to re-describe the API on the client.
 */
function assertAccountsResponse(body: unknown): asserts body is AccountsResponse {
  if (!isRecord(body)) {
    throw contractViolation('the response body was not an object');
  }

  const { data, meta } = body;

  if (!Array.isArray(data)) {
    throw contractViolation('`data` was not an array of accounts');
  }

  if (!isRecord(meta) || typeof meta.asOf !== 'string') {
    throw contractViolation('`meta` was missing the `asOf` field');
  }

  const withoutBalance = (data as unknown[]).findIndex(
    (account) => !isRecord(account) || !isRecord(account.balance),
  );

  if (withoutBalance !== -1) {
    throw contractViolation(
      `the account at index ${withoutBalance} came back without a balance, even though the request asked for balances`,
    );
  }
}

function contractViolation(problem: string): ApiError {
  return new ApiError({
    code: 'INVALID_RESPONSE',
    message: `GET /accounts returned an unexpected shape: ${problem}.`,
  });
}
