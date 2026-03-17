// src/features/reviews/api/reviewsApi.ts

import { request } from '@/shared/api/http';

import {
  mockCreateReview,
  mockGetContext,
} from './reviewsApi.mock';

import type {
  Review,
  ReviewContext,
  ReviewCreatePayload,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

/* REAL */
async function realGetContext(orderId: string): Promise<ReviewContext> {
  return request<ReviewContext>(
    `/me/reviews/context/${encodeURIComponent(orderId)}`,
  );
}

async function realCreateReview(
  payload: ReviewCreatePayload,
): Promise<Review> {
  return request<Review>('/me/reviews', {
    method: 'POST',
    body: payload,
  });
}

export const reviewsApi = {
  getContext: (orderId: string) =>
    USE_MOCK ? mockGetContext(orderId) : realGetContext(orderId),

  createReview: (payload: ReviewCreatePayload) =>
    USE_MOCK ? mockCreateReview(payload) : realCreateReview(payload),
};