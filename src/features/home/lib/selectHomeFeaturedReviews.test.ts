import { describe, expect, it } from 'vitest';

import type { HomeReview } from '../model/types';

import {
  isSubstantialReviewText,
  selectHomeFeaturedReviews,
} from './selectHomeFeaturedReviews';

const base = (): HomeReview => ({
  id: 'x',
  createdAtIso: '2026-01-01T00:00:00.000Z',
  rating: 5,
  text:
    'Достаточно длинный осмысленный текст отзыва клиента о сервисе и специалисте, чтобы пройти порог по символам и словам.',
  petName: 'П',
  ownerName: 'Имя',
  sitterId: 's',
  sitterName: 'С',
  serviceTitle: 'Услуга',
  photoUrls: ['/a.png'],
});

describe('isSubstantialReviewText', () => {
  it('отсекает слишком короткие и малословные тексты', () => {
    expect(isSubstantialReviewText('Всё супер.')).toBe(false);
    expect(
      isSubstantialReviewText(
        'Коротко: нормально, но без деталей и без достаточного объёма для главной.',
      ),
    ).toBe(false);
  });

  it('принимает развёрнутый текст', () => {
    expect(
      isSubstantialReviewText(
        'Очень подробный отзыв о том, как прошла услуга, что понравилось, что можно улучшить, и почему мы рекомендуем специалиста знакомым без оговорок.',
      ),
    ).toBe(true);
  });
});

describe('selectHomeFeaturedReviews', () => {
  it('возвращает до пяти последних по дате среди 5★, с фото и длинным текстом', () => {
    const list: HomeReview[] = [
      {
        ...base(),
        id: 'new',
        createdAtIso: '2026-03-22T00:00:00.000Z',
        rating: 5,
        photoUrls: ['/p.png'],
      },
      {
        ...base(),
        id: 'old-no-photo',
        createdAtIso: '2026-03-01T00:00:00.000Z',
        rating: 5,
        photoUrls: [],
      },
      {
        ...base(),
        id: 'old-4star',
        createdAtIso: '2026-03-21T00:00:00.000Z',
        rating: 4,
        photoUrls: ['/p.png'],
      },
      {
        ...base(),
        id: 'mid',
        createdAtIso: '2026-03-10T00:00:00.000Z',
        rating: 5,
        photoUrls: ['/p.png'],
      },
    ];

    const picked = selectHomeFeaturedReviews(list, 5);
    expect(picked.map((r) => r.id)).toEqual(['new', 'mid']);
  });
});
