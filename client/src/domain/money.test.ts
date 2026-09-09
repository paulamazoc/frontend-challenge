import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('renders an inflow with both cents', () => {
    expect(formatMoney(320000, 'CAD', 'en-CA')).toBe('$3,200.00');
  });

  it('renders an outflow as negative', () => {
    expect(formatMoney(-4599, 'CAD', 'en-CA')).toBe('-$45.99');
  });

  it('renders a zero balance', () => {
    expect(formatMoney(0, 'CAD', 'en-CA')).toBe('$0.00');
  });

  it('renders money owed on a credit card', () => {
    expect(formatMoney(-627122, 'CAD', 'en-CA')).toBe('-$6,271.22');
  });

  it('keeps every cent on a value large enough to be lossy in floating point', () => {
    expect(formatMoney(999999999, 'CAD', 'en-CA')).toBe('$9,999,999.99');
  });

  it('distinguishes currencies so totals are never read as interchangeable', () => {
    const cad = formatMoney(123456, 'CAD', 'en-CA');
    const usd = formatMoney(123456, 'USD', 'en-CA');

    expect(usd).not.toBe(cad);
    expect(cad).toContain('1,234.56');
    expect(usd).toContain('1,234.56');
  });

  it('rejects fractional minor units instead of rounding them away', () => {
    expect(() => formatMoney(45.5, 'CAD', 'en-CA')).toThrow(TypeError);
  });
});
