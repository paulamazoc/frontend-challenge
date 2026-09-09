import { describe, expect, it } from 'vitest';
import { transactionsSearchParams, type FetchTransactionsParams } from './transactions';

const baseParams: FetchTransactionsParams = {
  accountId: 'acc_visa',
  page: 1,
  pageSize: 25,
  sort: '-date',
  q: '',
};

const build = (overrides: Partial<FetchTransactionsParams> = {}) =>
  transactionsSearchParams({ ...baseParams, ...overrides });

describe('transactionsSearchParams', () => {
  /**
   * The highest-severity assertion in the ledger. `GET /transactions` without
   * an `accountId` returns every account's rows, and they would render under
   * this account's name and balance with nothing on screen looking wrong.
   */
  it('always scopes the request to one account', () => {
    expect(build().get('accountId')).toBe('acc_visa');
    expect(build({ page: 4, sort: 'amount', q: 'coffee' }).get('accountId')).toBe('acc_visa');
  });

  it('sends the paging window the URL asked for', () => {
    const query = build({ page: 4, pageSize: 100 });

    expect(query.get('page')).toBe('4');
    expect(query.get('pageSize')).toBe('100');
  });

  it('sends the sort token unchanged', () => {
    expect(build({ sort: '-amount' }).get('sort')).toBe('-amount');
  });

  it('sends a trimmed search term', () => {
    expect(build({ q: '  coffee  ' }).get('q')).toBe('coffee');
  });

  it('omits the search parameter entirely when there is no search', () => {
    expect(build({ q: '' }).has('q')).toBe(false);
    expect(build({ q: '   ' }).has('q')).toBe(false);
  });

  it('asks for the category relation the rows render', () => {
    expect(build().get('include')).toBe('category');
  });
});
