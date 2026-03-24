// src/features/reviews/data/mockReviews.ts

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
