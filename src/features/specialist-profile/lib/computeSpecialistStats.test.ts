import { describe, expect, it } from 'vitest';

import type { ServiceOrder } from '@/features/orders/model/types';

import { computeSpecialistStats } from './computeSpecialistStats';

import type { SpecialistReview } from '../model/types';

describe('computeSpecialistStats', () => {
  const orders: ServiceOrder[] = [
    {
      id: 'a',
      createdAt: '2026-01-01T10:00:00.000Z',
      dateFrom: '2026-01-02T10:00:00.000Z',
      schedule: { mode: 'fixed_slot', startAt: 'x', endAt: 'y' },
      petId: 'p1',
      petName: 'A',
      clientId: 'c1',
      clientName: 'U1',
      clientSlug: 'c1',
      sitterId: 'sp-1',
      sitterName: 'S',
      specialistSlug: 'slug-one',
      status: 'completed',
      serviceId: 's1',
      serviceTitle: 'Выгул',
      servicePriceUnit: 'service',
      serviceSnapshot: {
        id: 's1',
        title: 'Выгул',
        locationLabel: 'L',
        price: 100,
        priceUnit: 'service',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'L',
      price: 100,
      currency: 'RUB',
      hasReview: false,
      review: null,
      lifecycle: [],
    },
    {
      id: 'b',
      createdAt: '2026-01-01T10:00:00.000Z',
      dateFrom: '2026-01-03T10:00:00.000Z',
      schedule: { mode: 'fixed_slot', startAt: 'x', endAt: 'y' },
      petId: 'p1',
      petName: 'A',
      clientId: 'c1',
      clientName: 'U1',
      clientSlug: 'c1',
      sitterId: 'sp-1',
      sitterName: 'S',
      specialistSlug: 'slug-one',
      status: 'completed',
      serviceId: 's1',
      serviceTitle: 'Выгул',
      servicePriceUnit: 'service',
      serviceSnapshot: {
        id: 's1',
        title: 'Выгул',
        locationLabel: 'L',
        price: 100,
        priceUnit: 'service',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'L',
      price: 100,
      currency: 'RUB',
      hasReview: false,
      review: null,
      lifecycle: [],
    },
    {
      id: 'c',
      createdAt: '2026-01-01T10:00:00.000Z',
      dateFrom: '2026-01-04T10:00:00.000Z',
      schedule: { mode: 'fixed_slot', startAt: 'x', endAt: 'y' },
      petId: 'p2',
      petName: 'B',
      clientId: 'c2',
      clientName: 'U2',
      clientSlug: 'c2',
      sitterId: 'sp-1',
      sitterName: 'S',
      specialistSlug: 'slug-one',
      status: 'completed',
      serviceId: 's1',
      serviceTitle: 'Выгул',
      servicePriceUnit: 'service',
      serviceSnapshot: {
        id: 's1',
        title: 'Выгул',
        locationLabel: 'L',
        price: 100,
        priceUnit: 'service',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'L',
      price: 100,
      currency: 'RUB',
      hasReview: false,
      review: null,
      lifecycle: [],
    },
    {
      id: 'other',
      createdAt: '2026-01-01T10:00:00.000Z',
      dateFrom: '2026-01-04T10:00:00.000Z',
      schedule: { mode: 'fixed_slot', startAt: 'x', endAt: 'y' },
      petId: 'p2',
      petName: 'B',
      clientId: 'c2',
      clientName: 'U2',
      clientSlug: 'c2',
      sitterId: 'sp-2',
      sitterName: 'S2',
      specialistSlug: 'other',
      status: 'completed',
      serviceId: 's1',
      serviceTitle: 'Выгул',
      servicePriceUnit: 'service',
      serviceSnapshot: {
        id: 's1',
        title: 'Выгул',
        locationLabel: 'L',
        price: 100,
        priceUnit: 'service',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'L',
      price: 100,
      currency: 'RUB',
      hasReview: false,
      review: null,
      lifecycle: [],
    },
  ];

  const reviews: SpecialistReview[] = [
    {
      id: 'r1',
      rating: 4,
      createdAt: '2026-01-10',
      text: 'ok',
      authorName: 'A',
      petName: 'P',
      serviceTitle: 'Выгул',
    },
    {
      id: 'r2',
      rating: 5,
      createdAt: '2026-01-11',
      text: 'ok',
      authorName: 'B',
      petName: 'Q',
      serviceTitle: 'Выгул',
    },
  ];

  it('counts completed and repeat orders only for matching specialist', () => {
    const stats = computeSpecialistStats({
      id: 'sp-1',
      slug: 'slug-one',
      experienceYears: 3,
      reviews,
      orders,
    });

    expect(stats.completedOrdersCount).toBe(3);
    expect(stats.repeatOrdersCount).toBe(1);
    expect(stats.reviewsCount).toBe(2);
    expect(stats.rating).toBe(4.5);
    expect(stats.experienceYears).toBe(3);
  });
});
