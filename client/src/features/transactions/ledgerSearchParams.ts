import { isTransactionSort, type TransactionSort } from '@/api/transactions';

/**
 * The single place ledger navigation state crosses between the URL and typed
 * values. Components read a `LedgerParams` and describe changes; nothing else
 * touches `URLSearchParams`, parses a page number, or decides what a missing
 * value means.
 */

export const PAGE_SIZES = [25, 50, 100] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

export interface LedgerParams {
  page: number;
  pageSize: PageSize;
  sort: TransactionSort;
  q: string;
}

export const LEDGER_DEFAULTS: LedgerParams = {
  page: 1,
  pageSize: 25,
  sort: '-date',
  q: '',
};

export function parseLedgerParams(search: URLSearchParams): LedgerParams {
  return {
    page: parsePage(search.get('page')),
    pageSize: parsePageSize(search.get('pageSize')),
    sort: parseSort(search.get('sort')),
    q: search.get('q')?.trim() ?? LEDGER_DEFAULTS.q,
  };
}

export function ledgerParamsToSearch(params: LedgerParams): URLSearchParams {
  const search = new URLSearchParams();

  if (params.page !== LEDGER_DEFAULTS.page) {
    search.set('page', String(params.page));
  }

  if (params.pageSize !== LEDGER_DEFAULTS.pageSize) {
    search.set('pageSize', String(params.pageSize));
  }

  if (params.sort !== LEDGER_DEFAULTS.sort) {
    search.set('sort', params.sort);
  }

  if (params.q !== LEDGER_DEFAULTS.q) {
    search.set('q', params.q);
  }

  return search;
}

/**
 * Applies a change and returns to page one unless the page itself was the only
 * thing that changed.
 */
export function applyLedgerChange(
  current: LedgerParams,
  change: Partial<LedgerParams>,
): LedgerParams {
  const changedOnlyPage = Object.keys(change).every((key) => key === 'page');
  const next = { ...current, ...change };

  return changedOnlyPage ? next : { ...next, page: LEDGER_DEFAULTS.page };
}

function parsePage(raw: string | null): number {
  const page = Number(raw);

  return Number.isInteger(page) && page >= 1 ? page : LEDGER_DEFAULTS.page;
}

function parsePageSize(raw: string | null): PageSize {
  const pageSize = Number(raw);

  return isPageSize(pageSize) ? pageSize : LEDGER_DEFAULTS.pageSize;
}

function parseSort(raw: string | null): TransactionSort {
  return raw !== null && isTransactionSort(raw) ? raw : LEDGER_DEFAULTS.sort;
}

function isPageSize(value: number): value is PageSize {
  return (PAGE_SIZES as readonly number[]).includes(value);
}
