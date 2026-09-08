import { queryOptions } from '@tanstack/react-query';
import { fetchAccounts, type FetchAccountsParams } from '@/api/accounts';

/**
 * Only the keys this page uses. `asOf` is part of the key because balances at
 * two different dates are two different answers, not one answer that went
 * stale. `null` stands for "no date asked for", which is the server's current
 * balance.
 */
export const accountKeys = {
  list: (params: FetchAccountsParams = {}) =>
    ['accounts', 'list', { asOf: params.asOf ?? null }] as const,
};

export function accountsQueryOptions(params: FetchAccountsParams = {}) {
  return queryOptions({
    queryKey: accountKeys.list(params),
    queryFn: ({ signal }) => fetchAccounts(params, signal),
  });
}
