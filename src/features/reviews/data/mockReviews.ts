// src/features/reviews/data/mockReviews.ts

import type { Review, ReviewContext } from '../model/types';

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const MOCK_CONTEXTS: Record<string, ReviewContext> = {
  'so-1': {
    orderId: 'so-1',
    petId: 'p-1',
    petName: 'Ричи',
    ownerFullName: 'Иван Петров',
    sitterId: 's-1',
    sitterName: 'Анна',
    serviceTitle: 'Выгул собаки',
  },
};

export const MOCK_REVIEWS: Review[] = [];