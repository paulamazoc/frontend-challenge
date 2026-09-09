import type { CurrencyCode, Minor } from './api-types';

/**
 * Renders integer minor units as a currency string.
 *
 * Monetary values stay in integer minor units everywhere else in the app. This
 * function is the single point where they become major units, and the resulting
 * number is handed straight to `Intl.NumberFormat`.
 */
export function formatMoney(minor: Minor, currency: CurrencyCode, locale?: string): string {
  if (!Number.isInteger(minor)) {
    throw new TypeError(
      `formatMoney expects integer minor units, received ${minor}. A fractional value means ` +
        'major-unit arithmetic leaked into the domain.',
    );
  }

  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  // Each currency defines its own exponent (2 for CAD/USD/EUR, 0 for JPY), so
  // ask Intl for it rather than assuming 100 minor units per major unit. The
  // default covers runtimes that omit the resolved option.
  const { maximumFractionDigits = 2 } = formatter.resolvedOptions();

  return formatter.format(minor / 10 ** maximumFractionDigits);
}
