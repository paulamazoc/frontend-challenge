import { describe, expect, it } from 'vitest';
import { summarizeAccountBalance } from '@/features/accounts/accountBalanceSummary';
import type { AccountWithBalance } from '@/domain/accounts';
import { transactionAmountDirection } from './transactionAmount';

describe('transactionAmountDirection', () => {
  it('reads a negative amount as money leaving the account', () => {
    expect(transactionAmountDirection(-4599)).toBe('outflow');
  });

  it('reads a positive amount as money arriving', () => {
    expect(transactionAmountDirection(320000)).toBe('inflow');
  });

  it('reads zero as neither', () => {
    expect(transactionAmountDirection(0)).toBe('none');
  });

  it('does not adopt the credit-card owing frame that account balances use', () => {
    const visa: AccountWithBalance = {
      id: 'acc_visa',
      name: 'Visa',
      type: 'credit_card',
      institution: null,
      currency: 'CAD',
      openingBalance: 0,
      creditLimit: 1_500_000,
      color: '#2563eb',
      openedAt: '2025-04-01',
      archivedAt: null,
      createdAt: '2025-04-01T00:00:00.000Z',
      updatedAt: '2025-04-01T00:00:00.000Z',
      balance: {
        accountId: 'acc_visa',
        currency: 'CAD',
        asOf: '2026-09-09',
        openingBalance: 0,
        posted: -681_822,
        pending: 0,
        available: -681_822,
        transactionCount: 446,
        pendingCount: 0,
        creditLimit: 1_500_000,
        availableCredit: 818_178,
      },
    };

    expect(summarizeAccountBalance(visa).primaryAmount).toBe(681_822);

    expect(transactionAmountDirection(-4599)).toBe('outflow');
  });
});
