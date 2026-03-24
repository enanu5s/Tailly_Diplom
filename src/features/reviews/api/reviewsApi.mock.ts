// src/features/reviews/api/reviewsApi.mock.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type {
  Review,
  ReviewContext,
  ReviewCreatePayload,
} from '../model/types';

export async function mockGetContext(
  orderId: string,
): Promise<ReviewContext> {
  ensureMockDatabaseLoaded();

  const context = unsafeMutableMockDb().reviews.contexts[orderId];

  if (!context) {
    throw new Error('Контекст заказа не найден');
  }

  return cloneDeep(context);
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

  patchMockDatabase((db) => {
    db.reviews.list = [review, ...db.reviews.list];
  });

  return cloneDeep(review);
}
