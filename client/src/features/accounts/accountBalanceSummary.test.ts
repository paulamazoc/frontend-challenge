import { describe, expect, it } from 'vitest';
import type { AccountWithBalance } from '@/domain/accounts';
import type { AccountType, Minor } from '@/domain/api-types';
import { summarizeAccountBalance } from './accountBalanceSummary';

interface Fixture {
  type: AccountType;
  posted: Minor;
  pending: Minor;
  available: Minor;
}

function account({ type, posted, pending, available }: Fixture): AccountWithBalance {
  return {
    id: 'acc_test',
    name: 'Test Account',
    type,
    institution: null,
    currency: 'CAD',
    openingBalance: 0,
    creditLimit: null,
    color: '#000000',
    openedAt: '2025-01-01',
    archivedAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    balance: {
      accountId: 'acc_test',
      currency: 'CAD',
      asOf: '2026-01-01',
      openingBalance: 0,
      posted,
      pending,
      available,
      transactionCount: 0,
      pendingCount: 0,
      creditLimit: null,
      availableCredit: null,
    },
  };
}

describe('summarizeAccountBalance', () => {
  it('labels a deposit account as an available balance and passes the amounts through', () => {
    const summary = summarizeAccountBalance(
      account({ type: 'checking', posted: 705471, pending: -8950, available: 696521 }),
    );

    expect(summary).toEqual({
      primaryLabel: 'Available balance',
      primaryAmount: 696521,
      postedAmount: 705471,
      pendingAmount: -8950,
    });
  });

  it('keeps an overdrawn deposit account negative, because that is what it means', () => {
    const summary = summarizeAccountBalance(
      account({ type: 'checking', posted: -4500, pending: 0, available: -4500 }),
    );

    expect(summary.primaryLabel).toBe('Available balance');
    expect(summary.primaryAmount).toBe(-4500);
  });

  it('presents a credit-card debt as money owed rather than a negative balance', () => {
    const summary = summarizeAccountBalance(
      account({ type: 'credit_card', posted: -582747, pending: -99075, available: -681822 }),
    );

    expect(summary).toEqual({
      primaryLabel: 'Balance owing',
      primaryAmount: 681822,
      postedAmount: 582747,
      pendingAmount: 99075,
    });
  });

  it('shows a payment as a reduction once the card is in the owing frame', () => {
    const summary = summarizeAccountBalance(
      account({ type: 'credit_card', posted: -10000, pending: 2500, available: -7500 }),
    );

    expect(summary.primaryAmount).toBe(7500);
    expect(summary.pendingAmount).toBe(-2500);
  });

  it('treats an overpaid card as a credit balance, not a debt', () => {
    const summary = summarizeAccountBalance(
      account({ type: 'credit_card', posted: 5000, pending: 0, available: 5000 }),
    );

    expect(summary).toEqual({
      primaryLabel: 'Credit balance',
      primaryAmount: 5000,
      postedAmount: 5000,
      pendingAmount: 0,
    });
  });

  it('never produces negative zero, which would format with a stray minus sign', () => {
    const summary = summarizeAccountBalance(
      account({ type: 'credit_card', posted: 0, pending: -2500, available: -2500 }),
    );

    expect(Object.is(summary.postedAmount, -0)).toBe(false);
    expect(summary.postedAmount).toBe(0);
  });
});
