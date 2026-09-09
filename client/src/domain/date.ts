import type { IsoDate } from './api-types';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Turns a `YYYY-MM-DD` calendar date into a `Date` pinned to UTC midnight.
 *
 * The `Date` is a transport for the formatter, not a timestamp. Every reader
 * must interpret it in UTC, which is why `formatCalendarDate` passes
 * `timeZone: 'UTC'`. Rendering it in the local zone would move `2026-03-01` to
 * February 28 anywhere west of Greenwich.
 */
function toUtcMidnight(isoDate: IsoDate): Date {
  if (!ISO_DATE_PATTERN.test(isoDate)) {
    throw new RangeError(`Expected a YYYY-MM-DD calendar date, received "${isoDate}"`);
  }

  const date = new Date(`${isoDate}T00:00:00Z`);

  // Catches days that pass the pattern but do not exist, such as 2026-02-30.
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== isoDate) {
    throw new RangeError(`"${isoDate}" is not a real calendar date`);
  }

  return date;
}

/** Renders a calendar date for display without letting the local zone shift it. */
export function formatCalendarDate(isoDate: IsoDate, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    toUtcMidnight(isoDate),
  );
}
