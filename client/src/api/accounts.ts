import type { AccountsListMeta, AccountWithBalance } from '@/domain/accounts';
import type { Collection, IsoDate } from '@/domain/api-types';
import { apiFetch } from './client';
import { ApiError } from './errors';
import { isRecord } from './guards';

export type AccountsResponse = Collection<AccountWithBalance, AccountsListMeta>;

export interface FetchAccountsParams {
  asOf?: IsoDate;
}

export function accountsSearchParams(params: FetchAccountsParams = {}): URLSearchParams {
  const query = new URLSearchParams({ includeBalances: 'true' });

  if (params.asOf !== undefined) {
    query.set('asOf', params.asOf);
  }

  return query;
}

export async function fetchAccounts(
  params: FetchAccountsParams = {},
  signal?: AbortSignal,
): Promise<AccountsResponse> {
  const body = await apiFetch(`/accounts?${accountsSearchParams(params).toString()}`, { signal });

  assertAccountsResponse(body);

  return body;
}

/**
 * `GET /accounts/:id` already attaches the balance unconditionally, so the
 * account-detail screen gets its context in one request. The separate
 * `/accounts/:id/balance` endpoint answers the same question and earns its own
 * query only once a date can be chosen independently of the account.
 */
export async function fetchAccount(
  accountId: string,
  signal?: AbortSignal,
): Promise<AccountWithBalance> {
  const body = await apiFetch(`/accounts/${encodeURIComponent(accountId)}`, { signal });

  assertAccountResponse(body);

  return body.data;
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

/**
 * The detail screen leads with the balance and the currency it is stated in,
 * so those are the two assumptions worth failing on. The rest of the account is
 * trusted, as above.
 */
function assertAccountResponse(body: unknown): asserts body is { data: AccountWithBalance } {
  if (!isRecord(body) || !isRecord(body.data)) {
    throw contractViolation('the response body did not carry a `data` object', ':id');
  }

  const account = body.data;

  if (!isRecord(account.balance)) {
    throw contractViolation('the account came back without a balance', ':id');
  }

  if (typeof account.currency !== 'string') {
    throw contractViolation('the account came back without a currency', ':id');
  }
}

function contractViolation(problem: string, path = ''): ApiError {
  return new ApiError({
    code: 'INVALID_RESPONSE',
    message: `GET /accounts${path} returned an unexpected shape: ${problem}.`,
  });
}
