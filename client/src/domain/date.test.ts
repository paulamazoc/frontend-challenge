import { describe, expect, it } from 'vitest';
import { formatCalendarDate, isCalendarDate } from './date';

describe('isCalendarDate', () => {
  it('accepts a real calendar date', () => {
    expect(isCalendarDate('2026-08-31')).toBe(true);
  });

  it('rejects a timestamp and a day that does not exist', () => {
    expect(isCalendarDate('2026-06-14T18:22:05.114Z')).toBe(false);
    expect(isCalendarDate('2026-02-30')).toBe(false);
  });
});

describe('formatCalendarDate', () => {
  it('runs west of Greenwich, where date shifting would be visible', () => {
    expect(new Date().getTimezoneOffset()).toBeGreaterThan(0);
  });

  it('renders a mid-month date', () => {
    expect(formatCalendarDate('2026-06-14', 'en-US')).toBe('Jun 14, 2026');
  });

  it('does not shift the first day of a month backwards', () => {
    expect(formatCalendarDate('2026-03-01', 'en-US')).toBe('Mar 1, 2026');
  });

  it('does not shift the last day of a month forwards', () => {
    expect(formatCalendarDate('2026-01-31', 'en-US')).toBe('Jan 31, 2026');
  });

  it('rejects a value that is not a calendar date', () => {
    expect(() => formatCalendarDate('2026-06-14T18:22:05.114Z', 'en-US')).toThrow(RangeError);
  });

  it('rejects a day that does not exist', () => {
    expect(() => formatCalendarDate('2026-02-30', 'en-US')).toThrow(RangeError);
  });
});
