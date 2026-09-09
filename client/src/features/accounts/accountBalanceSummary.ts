import type { AccountWithBalance } from '@/domain/accounts';
import type { Minor } from '@/domain/api-types';

export interface AccountBalanceSummary {
  primaryLabel: string;
  primaryAmount: Minor;
  postedAmount: Minor;
  pendingAmount: Minor;
}

/**
 * Decides which balance an account card leads with, and in which frame.
 * Presentation only — the amounts are the server's, negated as integers. No
 * balance is recomputed here.
 */
export function summarizeAccountBalance(account: AccountWithBalance): AccountBalanceSummary {
  const { balance } = account;
  const isCreditCard = account.type === 'credit_card';

  if (isCreditCard && balance.available < 0) {
    return {
      primaryLabel: 'Balance owing',
      primaryAmount: negate(balance.available),
      postedAmount: negate(balance.posted),
      pendingAmount: negate(balance.pending),
    };
  }

  return {
    primaryLabel: isCreditCard ? 'Credit balance' : 'Available balance',
    primaryAmount: balance.available,
    postedAmount: balance.posted,
    pendingAmount: balance.pending,
  };
}

function negate(amount: Minor): Minor {
  return amount === 0 ? 0 : -amount;
}
