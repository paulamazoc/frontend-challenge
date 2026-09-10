import type { IsoDate } from './api-types';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True for a real `YYYY-MM-DD` calendar date. Used to accept URL and form
 * values without throwing, and without treating a timestamp as a business day.
 */
export function isCalendarDate(value: string): value is IsoDate {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Turns a `YYYY-MM-DD` calendar date into a `Date` pinned to UTC midnight.
 *
 * The `Date` is a transport for the formatter, not a timestamp. Every reader
 * must interpret it in UTC, which is why `formatCalendarDate` passes
 * `timeZone: 'UTC'`. Rendering it in the local zone would move `2026-03-01` to
 * February 28 anywhere west of Greenwich.
 */
function toUtcMidnight(isoDate: IsoDate): Date {
  if (!isCalendarDate(isoDate)) {
    throw new RangeError(
      ISO_DATE_PATTERN.test(isoDate)
        ? `"${isoDate}" is not a real calendar date`
        : `Expected a YYYY-MM-DD calendar date, received "${isoDate}"`,
    );
  }

  return new Date(`${isoDate}T00:00:00Z`);
}

/** Renders a calendar date for display without letting the local zone shift it. */
export function formatCalendarDate(isoDate: IsoDate, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    toUtcMidnight(isoDate),
  );
}
