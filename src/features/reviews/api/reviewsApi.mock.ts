// src/features/reviews/api/reviewsApi.mock.ts

import {
  deepCopy,
  MOCK_CONTEXTS,
  MOCK_REVIEWS,
} from '../data/mockReviews';

import type {
  Review,
  ReviewContext,
  ReviewCreatePayload,
} from '../model/types';


export async function mockGetContext(
  orderId: string,
): Promise<ReviewContext> {
  const context = MOCK_CONTEXTS[orderId];

  if (!context) {
    throw new Error('Контекст заказа не найден');
  }

  return deepCopy(context);
}

export async function mockCreateReview(
  payload: ReviewCreatePayload,
): Promise<Review> {
  const context = await mockGetContext(payload.orderId);

  const review: Review = {
    id: `r-${Math.random().toString(16).slice(2)}`,
    orderId: payload.orderId,
    rating: payload.rating,
    text: payload.text,
    photoUrls: payload.photoUrls,
    createdAtIso: new Date().toISOString(),
    petName: context.petName,
    ownerFullName: context.ownerFullName,
    sitterId: context.sitterId,
    sitterName: context.sitterName,
    serviceTitle: context.serviceTitle,
  };

  MOCK_REVIEWS.unshift(review);

  return deepCopy(review);
}