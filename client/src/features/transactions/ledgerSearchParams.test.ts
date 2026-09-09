import { describe, expect, it } from 'vitest';
import {
  LEDGER_DEFAULTS,
  applyLedgerChange,
  ledgerParamsToSearch,
  parseLedgerParams,
  type LedgerParams,
} from './ledgerSearchParams';

const parse = (search: string) => parseLedgerParams(new URLSearchParams(search));
const serialize = (params: LedgerParams) => ledgerParamsToSearch(params).toString();

describe('parseLedgerParams', () => {
  it('falls back to the endpoint defaults for an untouched URL', () => {
    expect(parse('')).toEqual(LEDGER_DEFAULTS);
  });

  it('reads a fully specified URL', () => {
    expect(parse('page=4&pageSize=50&sort=amount&q=coffee')).toEqual({
      page: 4,
      pageSize: 50,
      sort: 'amount',
      q: 'coffee',
    });
  });

  /**
   * These are hand-edited and shared URLs, not values the UI can produce. Every
   * one of them must resolve to something the API accepts: a page the server
   * would reject fails the whole screen, and a page it silently reinterprets
   * shows the wrong rows.
   */
  it.each(['page=0', 'page=-3', 'page=abc', 'page=2.5', 'page='])(
    'rejects an unusable page in ?%s',
    (search) => {
      expect(parse(search).page).toBe(1);
    },
  );

  it.each(['pageSize=999', 'pageSize=0', 'pageSize=30', 'pageSize=abc'])(
    'rejects a page size outside the offered set in ?%s',
    (search) => {
      expect(parse(search).pageSize).toBe(25);
    },
  );

  it.each(['sort=ssn', 'sort=merchant', 'sort=-DATE', 'sort='])(
    'falls back to newest-first for an unsupported sort in ?%s',
    (search) => {
      expect(parse(search).sort).toBe('-date');
    },
  );

  it('trims the search term', () => {
    expect(parse('q=%20%20coffee%20%20').q).toBe('coffee');
  });

  it('treats a blank search term as no search', () => {
    expect(parse('q=%20%20').q).toBe('');
  });
});

describe('ledgerParamsToSearch', () => {
  it('writes nothing for default state, so an untouched ledger has a clean URL', () => {
    expect(serialize(LEDGER_DEFAULTS)).toBe('');
  });

  it('writes only the values that differ from the defaults', () => {
    expect(serialize({ ...LEDGER_DEFAULTS, page: 3 })).toBe('page=3');
    expect(serialize({ ...LEDGER_DEFAULTS, sort: 'amount' })).toBe('sort=amount');
    expect(serialize({ ...LEDGER_DEFAULTS, q: 'rent' })).toBe('q=rent');
  });

  it('round-trips a fully specified state', () => {
    const params: LedgerParams = { page: 7, pageSize: 100, sort: '-amount', q: 'via rail' };

    expect(parseLedgerParams(ledgerParamsToSearch(params))).toEqual(params);
  });
});

describe('applyLedgerChange', () => {
  const onPageTwelve: LedgerParams = { page: 12, pageSize: 25, sort: '-date', q: '' };

  it('keeps the requested page when only the page changed', () => {
    expect(applyLedgerChange(onPageTwelve, { page: 13 }).page).toBe(13);
  });

  const pageResettingChanges: [string, Partial<LedgerParams>][] = [
    ['a search', { q: 'coffee' }],
    ['a sort', { sort: 'amount' }],
    ['a page size', { pageSize: 100 }],
  ];

  it.each(pageResettingChanges)('returns to page one when %s changes', (_label, change) => {
    expect(applyLedgerChange(onPageTwelve, change).page).toBe(1);
  });

  it('leaves the other values alone', () => {
    expect(applyLedgerChange(onPageTwelve, { q: 'coffee' })).toEqual({
      page: 1,
      pageSize: 25,
      sort: '-date',
      q: 'coffee',
    });
  });
});
