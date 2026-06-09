// src/shared/mock-db/accessors/reviews.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { patchMockDatabase, unsafeMutableMockDb } from '@/shared/mock-db/store';

import type { Review, ReviewContext } from '@/features/reviews/model/types';

export function readReviews(): Review[] {
  return cloneDeep(unsafeMutableMockDb().reviews.list);
}

export function readReviewContexts(): Record<string, ReviewContext> {
  return cloneDeep(unsafeMutableMockDb().reviews.contexts);
}

export function patchReviews(recipe: (db: { list: Review[]; contexts: Record<string, ReviewContext> }) => void): void {
  patchMockDatabase((db) => {
    recipe(db.reviews);
  });
}
