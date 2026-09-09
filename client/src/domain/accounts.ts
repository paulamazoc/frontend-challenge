import type {
  Account,
  AccountType,
  Balance,
  CurrencyCode,
  CurrencyTotal,
  IsoDate,
} from './api-types';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Chequing',
  savings: 'Savings',
  credit_card: 'Credit card',
  cash: 'Cash',
  investment: 'Investment',
};

/**
 * `GET /api/accounts` does not paginate, so its `meta` is not the shared
 * `ListMeta` that `api-types.ts` defaults `Collection` to. The server returns
 * the balance date and per-currency totals instead. The server is the source of
 * truth; this type records the difference on the client side.
 */
export interface AccountsListMeta {
  total: number;
  asOf: IsoDate;
  totalsByCurrency: Partial<Record<CurrencyCode, CurrencyTotal>>;
}

/**
 * `Account.balance` is optional in the wire contract because
 * `includeBalances=false` exists. The accounts list always asks for balances, so
 * this narrowing lets the UI read `account.balance` without a null check on
 * every screen. The narrowing is verified at the API boundary, not assumed.
 */
export type AccountWithBalance = Account & { balance: Balance };
