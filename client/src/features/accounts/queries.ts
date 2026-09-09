import { queryOptions } from '@tanstack/react-query';
import { fetchAccount, fetchAccounts, type FetchAccountsParams } from '@/api/accounts';
import { isApiError } from '@/api/errors';

/**
 * Only the keys these pages use. `asOf` is part of the list key because
 * balances at two different dates are two different answers, not one answer
 * that went stale. `null` stands for "no date asked for", which is the server's
 * current balance.
 *
 * `detail` carries no `asOf` because no caller can supply one yet, and a key
 * parameter for a query that does not exist is a key that will drift.
 */
export const accountKeys = {
  list: (params: FetchAccountsParams = {}) =>
    ['accounts', 'list', { asOf: params.asOf ?? null }] as const,
  detail: (accountId: string) => ['accounts', 'detail', accountId] as const,
};

export function accountsQueryOptions(params: FetchAccountsParams = {}) {
  return queryOptions({
    queryKey: accountKeys.list(params),
    queryFn: ({ signal }) => fetchAccounts(params, signal),
  });
}

export function accountQueryOptions(accountId: string) {
  return queryOptions({
    queryKey: accountKeys.detail(accountId),
    queryFn: ({ signal }) => fetchAccount(accountId, signal),
    // A mistyped or stale account URL is an answer, not a failure. Retrying it
    // only makes the user wait a second round-trip to be told the same thing.
    retry: (failureCount, error) =>
      !(isApiError(error) && error.status === 404) && failureCount < 1,
  });
}
