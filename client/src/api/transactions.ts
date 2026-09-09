import type { Collection, ListMeta, Transaction } from '@/domain/api-types';
import { apiFetch } from './client';
import { ApiError } from './errors';
import { isRecord } from './guards';

export type TransactionsResponse = Collection<Transaction, ListMeta>;

/**
 * The sort tokens the ledger uses, in the endpoint's own syntax: a field name,
 * optionally prefixed with `-` for descending. The server accepts more fields
 * than these; this list is what the UI offers, and it lives here because the
 * set of legal values is part of the endpoint's contract.
 */
export const TRANSACTION_SORTS = ['-date', 'date', '-amount', 'amount'] as const;

export type TransactionSort = (typeof TRANSACTION_SORTS)[number];

export function isTransactionSort(value: string): value is TransactionSort {
  return (TRANSACTION_SORTS as readonly string[]).includes(value);
}

export interface FetchTransactionsParams {
  accountId: string;
  page: number;
  pageSize: number;
  sort: TransactionSort;
  q: string;
}

/**
 * Built separately from the request so the parameters this screen depends on
 * can be asserted directly. `accountId` is the one that matters.
 */
export function transactionsSearchParams(params: FetchTransactionsParams): URLSearchParams {
  const query = new URLSearchParams({
    accountId: params.accountId,
    page: String(params.page),
    pageSize: String(params.pageSize),
    sort: params.sort,
    include: 'category',
  });

  const q = params.q.trim();

  if (q !== '') {
    query.set('q', q);
  }

  return query;
}

export async function fetchTransactions(
  params: FetchTransactionsParams,
  signal?: AbortSignal,
): Promise<TransactionsResponse> {
  const body = await apiFetch(`/transactions?${transactionsSearchParams(params).toString()}`, {
    signal,
  });

  assertTransactionsResponse(body);

  return body;
}

/**
 * Checks the `data` array and the four `meta` counters the ledger reads. A
 * missing `total` would quietly render "of 0" beside twenty-five visible rows;
 * a missing `page` would desynchronise the pagination control from the URL.
 * Individual transaction fields are trusted, as elsewhere at this boundary.
 */
function assertTransactionsResponse(body: unknown): asserts body is TransactionsResponse {
  if (!isRecord(body)) {
    throw contractViolation('the response body was not an object');
  }

  const { data, meta } = body;

  if (!Array.isArray(data)) {
    throw contractViolation('`data` was not an array of transactions');
  }

  if (!isRecord(meta)) {
    throw contractViolation('`meta` was missing');
  }

  const counters = ['total', 'count', 'page', 'pageSize', 'offset', 'totalPages'] as const;
  const missing = counters.find((counter) => typeof meta[counter] !== 'number');

  if (missing !== undefined) {
    throw contractViolation(`\`meta.${missing}\` was not a number`);
  }
}

function contractViolation(problem: string): ApiError {
  return new ApiError({
    code: 'INVALID_RESPONSE',
    message: `GET /transactions returned an unexpected shape: ${problem}.`,
  });
}
