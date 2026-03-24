// src/features/home/lib/homeFeaturedReviewsDayCache.ts

import type { HomeReview } from '../model/types';

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let cachedDayKey: string | null = null;
let cachedReviews: HomeReview[] | null = null;

function getLocalCalendarDayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Один снимок списка отзывов на календарный день (локальная дата браузера):
 * при повторных запросах в тот же день возвращается тот же массив.
 */
export function getHomeFeaturedReviewsForCurrentDay(
  compute: () => HomeReview[],
): HomeReview[] {
  const dayKey = getLocalCalendarDayKey();
  if (cachedDayKey === dayKey && cachedReviews) {
    return deepCopy(cachedReviews);
  }
  const next = compute();
  cachedDayKey = dayKey;
  cachedReviews = deepCopy(next);
  return deepCopy(next);
}
