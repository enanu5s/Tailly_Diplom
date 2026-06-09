// src/shared/mock-db/accessors/derived/homeReviews.ts

import type { HomeReview } from '@/features/home/model/types';
import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { unsafeMutableMockDb } from '@/shared/mock-db/store';

export function getHomeReviewsFromDb(): HomeReview[] {
  const db = unsafeMutableMockDb();
  const cityBySitterId = new Map(
    db.specialists.profiles.map((p) => [p.id, p.main.city] as const),
  );

  return db.reviews.list
    .filter((r) => r.rating === 5)
    .map(
      (r): HomeReview => ({
        id: r.id,
        createdAtIso: r.createdAtIso,
        rating: r.rating,
        text: r.text,
        petName: r.petName,
        ownerName: r.ownerFullName,
        sitterId: r.sitterId,
        sitterName: r.sitterName,
        serviceTitle: r.serviceTitle,
        photoUrls: r.photoUrls,
        city: cityBySitterId.get(r.sitterId) ?? 'Москва',
      }),
    )
    .sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime());
}

export function cloneHomeReviews(): HomeReview[] {
  return cloneDeep(getHomeReviewsFromDb());
}
