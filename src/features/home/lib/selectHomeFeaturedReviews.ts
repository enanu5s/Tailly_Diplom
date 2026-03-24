// src/features/home/lib/selectHomeFeaturedReviews.ts

import type { HomeReview } from '../model/types';

/** Минимум символов без лишних пробелов — отсекает короткие «отписки». */
export const HOME_FEATURED_REVIEW_MIN_CHARS = 80;

/** Минимум слов — дополнительная защита от размытых фраз из пары слов. */
export const HOME_FEATURED_REVIEW_MIN_WORDS = 8;

export function isSubstantialReviewText(text: string): boolean {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length < HOME_FEATURED_REVIEW_MIN_CHARS) {
    return false;
  }
  const words = normalized.split(' ').filter(Boolean);
  return words.length >= HOME_FEATURED_REVIEW_MIN_WORDS;
}

export function isEligibleHomeFeaturedReview(review: HomeReview): boolean {
  if (review.rating !== 5) {
    return false;
  }
  if (!review.photoUrls || review.photoUrls.length === 0) {
    return false;
  }
  return isSubstantialReviewText(review.text);
}

/**
 * Пять последних отзывов клиентов: 5★, есть хотя бы одно фото, осмысленный текст.
 * Сортировка по дате создания (новые первыми).
 */
export function selectHomeFeaturedReviews(
  reviews: HomeReview[],
  limit = 5,
): HomeReview[] {
  const eligible = reviews.filter(isEligibleHomeFeaturedReview);
  const sorted = [...eligible].sort((a, b) => {
    const ta = new Date(a.createdAtIso).getTime();
    const tb = new Date(b.createdAtIso).getTime();
    return tb - ta;
  });
  return sorted.slice(0, limit);
}
