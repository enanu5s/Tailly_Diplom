// src/features/specialist-profile/lib/computeSpecialistStats.ts

import { readMockServiceOrders } from '@/features/orders/data/mockOrders';

import type { ServiceOrder } from '@/features/orders/model/types';

import type { SpecialistReview, SpecialistStats } from '../model/types';

export type ComputeSpecialistStatsInput = {
  id: string;
  slug: string;
  experienceYears: number;
  reviews: SpecialistReview[];
  /** Если не передан — берутся актуальные заказы из мок-хранилища. */
  orders?: ServiceOrder[];
};

/**
 * Рейтинг и число отзывов — по списку отзывов профиля;
 * выполненные и повторные заказы — по заказам услуг для этого специалиста.
 */
export function computeSpecialistStats(
  input: ComputeSpecialistStatsInput,
): SpecialistStats {
  const orders = input.orders ?? readMockServiceOrders();
  const slugNorm = input.slug.trim().toLowerCase();
  const pid = input.id.trim();

  const specialistOrders = orders.filter(
    (o) =>
      o.specialistSlug.trim().toLowerCase() === slugNorm ||
      o.sitterId.trim() === pid,
  );

  const completed = specialistOrders.filter((o) => o.status === 'completed');
  const completedOrdersCount = completed.length;

  const byClient = new Map<string, number>();
  for (const o of completed) {
    const cid = o.clientId.trim();
    byClient.set(cid, (byClient.get(cid) ?? 0) + 1);
  }

  let repeatOrdersCount = 0;
  for (const n of byClient.values()) {
    if (n > 1) {
      repeatOrdersCount += n - 1;
    }
  }

  const reviews = input.reviews;
  const reviewsCount = reviews.length;

  let rating = 0;
  if (reviewsCount > 0) {
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    rating = Number((sum / reviewsCount).toFixed(1));
  }

  return {
    experienceYears: input.experienceYears,
    rating,
    reviewsCount,
    completedOrdersCount,
    repeatOrdersCount,
  };
}
