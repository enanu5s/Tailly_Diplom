//src/features/reviews/service/reviewsService.ts
import { reviewsApi } from '../api/reviewsApi';

import type { Review, ReviewContext, ReviewCreatePayload } from '../model/types';

export const reviewsService = {
  getContext: (orderId: string): Promise<ReviewContext> => reviewsApi.getContext(orderId),
  createReview: (payload: ReviewCreatePayload): Promise<Review> =>
    reviewsApi.createReview(payload),
};
