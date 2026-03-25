import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServiceOrder } from '@/features/orders/model/types';

import {
  computeSpecialistOrderStats,
  filterOrdersForSpecialistAndPeriod,
  getPeriodStart,
} from './computeSpecialistOrderStats';

function minimalOrder(
  overrides: Partial<ServiceOrder> & Pick<ServiceOrder, 'id' | 'status' | 'specialistSlug'>,
): ServiceOrder {
  return {
    createdAt: '2026-02-01T12:00:00.000Z',
    dateFrom: '2026-02-02T12:00:00.000Z',
    schedule: { mode: 'fixed_slot', startAt: 'x', endAt: 'y' },
    petId: 'p',
    petName: 'P',
    clientId: 'c',
    clientName: 'C',
    clientSlug: 'c',
    sitterId: 's',
    sitterName: 'S',
    serviceId: 'svc',
    serviceTitle: 'Услуга',
    servicePriceUnit: 'service',
    serviceSnapshot: {
      id: 'svc',
      title: 'Услуга',
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
    ...overrides,
  };
}

describe('getPeriodStart', () => {
  it('для all возвращает null', () => {
    expect(getPeriodStart('all')).toBeNull();
  });

  it('для 7d вычитает 7 дней и сбрасывает время на начало локального дня', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-25T15:00:00.000Z'));
    const start = getPeriodStart('7d');
    expect(start).not.toBeNull();
    const now = new Date();
    const expected = new Date(now);
    expected.setDate(expected.getDate() - 7);
    expected.setHours(0, 0, 0, 0);
    expect(start!.getTime()).toBe(expected.getTime());
    vi.useRealTimers();
  });
});

describe('filterOrdersForSpecialistAndPeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-25T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const orders: ServiceOrder[] = [
    minimalOrder({
      id: '1',
      specialistSlug: 'alpha',
      status: 'completed',
      createdAt: '2026-03-24T10:00:00.000Z',
    }),
    minimalOrder({
      id: '2',
      specialistSlug: 'alpha',
      status: 'canceled',
      createdAt: '2026-03-10T10:00:00.000Z',
    }),
    minimalOrder({
      id: '3',
      specialistSlug: 'beta',
      status: 'completed',
      createdAt: '2026-03-24T10:00:00.000Z',
    }),
  ];

  it('фильтрует по slug и обрезает пробелы', () => {
    const filtered = filterOrdersForSpecialistAndPeriod(orders, ' alpha ', '30d');
    expect(filtered.map((o) => o.id).sort()).toEqual(['1', '2']);
  });

  it('за all включает старые заказы этого специалиста', () => {
    const filtered = filterOrdersForSpecialistAndPeriod(orders, 'alpha', 'all');
    expect(filtered).toHaveLength(2);
  });

  it('исключает заказы старше окна периода', () => {
    const filtered = filterOrdersForSpecialistAndPeriod(orders, 'alpha', '7d');
    expect(filtered.map((o) => o.id)).toEqual(['1']);
  });
});

describe('computeSpecialistOrderStats', () => {
  it('пустой список даёт нули и null где уместно', () => {
    const s = computeSpecialistOrderStats([]);
    expect(s.totalInPeriod).toBe(0);
    expect(s.completedCount).toBe(0);
    expect(s.avgCheckRub).toBeNull();
    expect(s.cancellationRatePercent).toBeNull();
    expect(s.avgRating).toBeNull();
  });

  it('считает выручку, статусы и средний чек', () => {
    const orders: ServiceOrder[] = [
      minimalOrder({
        id: 'a',
        status: 'completed',
        specialistSlug: 'x',
        serviceTitle: 'Стрижка',
        clientId: 'c1',
        clientName: 'Иван',
        price: 200,
        hasReview: true,
        rating: 4,
      }),
      minimalOrder({
        id: 'b',
        status: 'completed',
        specialistSlug: 'x',
        serviceTitle: 'Стрижка',
        clientId: 'c1',
        clientName: 'Иван',
        price: 400,
        hasReview: true,
        rating: 5,
      }),
      minimalOrder({
        id: 'c',
        status: 'canceled',
        specialistSlug: 'x',
        serviceTitle: 'Другое',
        clientId: 'c2',
        clientName: 'Пётр',
        price: 100,
        hasReview: false,
      }),
    ];
    const s = computeSpecialistOrderStats(orders);
    expect(s.totalInPeriod).toBe(3);
    expect(s.completedCount).toBe(2);
    expect(s.completedRevenueRub).toBe(600);
    expect(s.avgCheckRub).toBe(300);
    expect(s.cancellationRatePercent).toBeCloseTo(33.3, 1);
    expect(s.ordersWithReview).toBe(2);
    expect(s.avgRating).toBe(4.5);
    expect(s.statusCounts.canceled).toBe(1);
    expect(s.byService[0]?.serviceTitle).toBe('Стрижка');
    expect(s.topClients[0]?.clientName).toBe('Иван');
  });
});
