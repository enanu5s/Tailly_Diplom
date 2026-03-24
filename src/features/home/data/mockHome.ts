// src/features/home/data/mockHome.ts

import type { HomeReview } from '../model/types';

export const MOCK_REVIEWS: HomeReview[] = [
  {
    id: 'rv-1',
    createdAtIso: '2026-02-23T12:00:00.000Z',
    rating: 5,
    text: 'Очень внимательный специалист! Ричи вернулся довольный.',
    petName: 'Ричи',
    ownerName: 'Иван Петров',
    sitterId: 's-1',
    sitterName: 'Анна',
    serviceTitle: 'Выгул',
    photoUrls: ['/images/reviews/r-1.png', '/images/reviews/r-2.png'],
  },
  {
    id: 'rv-2',
    createdAtIso: '2026-02-21T12:00:00.000Z',
    rating: 5,
    text: 'Передержка прошла идеально.\nФото каждый день.',
    petName: 'Мия',
    ownerName: 'Мария К.',
    sitterId: 's-2',
    sitterName: 'Сергей',
    serviceTitle: 'Передержка',
    photoUrls: [],
  },
];

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
