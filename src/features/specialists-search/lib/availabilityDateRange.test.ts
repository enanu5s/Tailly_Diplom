import { describe, expect, it } from 'vitest';

import { dateRangeIntersectsWeekdays } from './availabilityDateRange';

describe('dateRangeIntersectsWeekdays', () => {
  it('пн–пт: диапазон включает будни', () => {
    const wd = new Set([1, 2, 3, 4, 5]);
    expect(dateRangeIntersectsWeekdays('2026-03-23', '2026-03-27', wd)).toBe(true);
  });

  it('только субботы в диапазоне без суббот у специалиста — false', () => {
    const wd = new Set([1, 2, 3, 4, 5]);
    expect(dateRangeIntersectsWeekdays('2026-03-28', '2026-03-29', wd)).toBe(false);
  });

  it('одна дата «с»', () => {
    expect(dateRangeIntersectsWeekdays('2026-03-28', null, new Set([6]))).toBe(true);
  });
});
