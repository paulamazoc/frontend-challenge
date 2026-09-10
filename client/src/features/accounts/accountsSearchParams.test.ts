import { describe, expect, it } from 'vitest';
import {
  accountsParamsToSearch,
  parseAccountsParams,
  type AccountsParams,
} from './accountsSearchParams';

const parse = (search: string) => parseAccountsParams(new URLSearchParams(search));
const serialize = (params: AccountsParams) => accountsParamsToSearch(params).toString();

describe('parseAccountsParams', () => {
  it('treats an untouched URL as current/latest balances', () => {
    expect(parse('')).toEqual({});
  });

  it('reads a valid calendar date', () => {
    expect(parse('asOf=2026-08-31')).toEqual({ asOf: '2026-08-31' });
  });

  it.each(['asOf=2026-02-30', 'asOf=2026-06-14T18:22:05.114Z', 'asOf=yesterday', 'asOf=', 'asOf=2026-13-01'])(
    'falls back to current balances for ?%s',
    (search) => {
      expect(parse(search)).toEqual({});
    },
  );
});

describe('accountsParamsToSearch', () => {
  it('writes nothing for current/latest, so Today leaves a clean URL', () => {
    expect(serialize({})).toBe('');
  });

  it('writes the selected date unchanged', () => {
    expect(serialize({ asOf: '2026-08-31' })).toBe('asOf=2026-08-31');
  });

  it('round-trips a selected date', () => {
    expect(parseAccountsParams(accountsParamsToSearch({ asOf: '2026-03-01' }))).toEqual({
      asOf: '2026-03-01',
    });
  });
});
