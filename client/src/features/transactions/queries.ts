import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { fetchTransactions, type FetchTransactionsParams } from '@/api/transactions';

/**
 * Every parameter that changes the answer, and nothing else. `include=category`
 * is a constant of the request rather than a variable, so it stays out.
 */
export const transactionKeys = {
  list: (params: FetchTransactionsParams) =>
    [
      'transactions',
      'list',
      {
        accountId: params.accountId,
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
        q: params.q,
      },
    ] as const,
};

export function transactionsQueryOptions(params: FetchTransactionsParams) {
  return queryOptions({
    queryKey: transactionKeys.list(params),
    queryFn: ({ signal }) => fetchTransactions(params, signal),
    // Paging, sorting and searching all change the key. Without this the table
    // collapses to a spinner and the page reflows on every interaction.
    placeholderData: keepPreviousData,
  });
}
