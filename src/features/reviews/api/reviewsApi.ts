// src/features/reviews/api/reviewsApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import { mockCreateReview, mockGetContext } from './reviewsApi.mock';

import type { Review, ReviewContext, ReviewCreatePayload } from '../model/types';

/* REAL */
async function realGetContext(orderId: string): Promise<ReviewContext> {
  return request<ReviewContext>(`/me/reviews/context/${encodeURIComponent(orderId)}`);
}

async function realCreateReview(payload: ReviewCreatePayload): Promise<Review> {
  return request<Review>('/me/reviews', {
    method: 'POST',
    body: payload,
  });
}

export const reviewsApi = {
  getContext: (orderId: string) =>
    isMockApiMode ? mockGetContext(orderId) : realGetContext(orderId),

  createReview: (payload: ReviewCreatePayload) =>
    isMockApiMode ? mockCreateReview(payload) : realCreateReview(payload),
};
