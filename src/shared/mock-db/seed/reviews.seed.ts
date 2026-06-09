// src/shared/mock-db/seed/reviews.seed.ts

import { buildSeedHomeReviews } from './homeReviews.seed';

import type { Review, ReviewContext } from '@/features/reviews/model/types';
import type { ServiceOrder } from '@/features/orders/model/types';

const MIN_HOME_REVIEW_CHARS = 80;

function isSubstantial(text: string): boolean {
  return text.replace(/\s+/g, ' ').trim().length >= MIN_HOME_REVIEW_CHARS;
}

export function buildSeedReviewsFromOrders(orders: ServiceOrder[]): {
  list: Review[];
  contexts: Record<string, ReviewContext>;
} {
  const list: Review[] = [];
  const contexts: Record<string, ReviewContext> = {};
  const seenOrderIds = new Set<string>();

  for (const order of orders) {
    if (order.status === 'completed' && !order.hasReview) {
      contexts[order.id] = {
        orderId: order.id,
        petId: order.petId,
        petName: order.petName,
        ownerFullName: order.clientName,
        sitterId: order.sitterId,
        sitterName: order.sitterName,
        serviceTitle: order.serviceTitle,
      };
    }

    if (order.status !== 'completed' || !order.hasReview || !order.review) {
      continue;
    }

    const text = order.review.comment.trim();
    const photos = order.review.photos ?? [];

    if (!isSubstantial(text) || photos.length === 0 || order.review.rating !== 5) {
      continue;
    }

    list.push({
      id: `review-${order.id}`,
      orderId: order.id,
      rating: order.review.rating,
      text,
      photoUrls: photos,
      createdAtIso: order.review.createdAt,
      petName: order.petName,
      ownerFullName: order.clientName,
      sitterId: order.sitterId,
      sitterName: order.sitterName,
      serviceTitle: order.serviceTitle,
    });
    seenOrderIds.add(order.id);
  }

  for (const homeReview of buildSeedHomeReviews()) {
    if (seenOrderIds.has(homeReview.orderId)) {
      continue;
    }

    list.push(homeReview);
    seenOrderIds.add(homeReview.orderId);
  }

  list.sort(
    (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
  );

  return { list, contexts };
}
