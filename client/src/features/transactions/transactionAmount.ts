import type { Minor } from '@/domain/api-types';

export type AmountDirection = 'inflow' | 'outflow' | 'none';

/**
 * The API's sign convention for a transaction is money movement on the account:
 * negative left, positive arrived, zero did neither.
 */
export function transactionAmountDirection(amount: Minor): AmountDirection {
  if (amount > 0) return 'inflow';
  if (amount < 0) return 'outflow';

  return 'none';
}
