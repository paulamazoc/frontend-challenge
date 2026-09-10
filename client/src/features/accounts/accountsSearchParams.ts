import type { IsoDate } from '@/domain/api-types';
import { isCalendarDate } from '@/domain/date';

export interface AccountsParams {
  asOf?: IsoDate;
}

export function parseAccountsParams(search: URLSearchParams): AccountsParams {
  const raw = search.get('asOf');

  if (raw === null || !isCalendarDate(raw)) {
    return {};
  }

  return { asOf: raw };
}

export function accountsParamsToSearch(params: AccountsParams): URLSearchParams {
  const search = new URLSearchParams();

  if (params.asOf !== undefined) {
    search.set('asOf', params.asOf);
  }

  return search;
}
