// src/shared/mock-db/seed/pickupPoints.seed.ts

import type { PickupPoint } from '@/features/shop/model/types';

export const SEED_PICKUP_POINTS: PickupPoint[] = [
  {
    id: 'pickup-cdek-1',
    provider: 'cdek',
    title: 'СДЭК — ПВЗ на Тверской',
    address: 'Москва, ул. Тверская, д. 12',
    estimatedDate: '2026-03-11',
  },
  {
    id: 'pickup-cdek-2',
    provider: 'cdek',
    title: 'СДЭК — ПВЗ на Арбате',
    address: 'Москва, ул. Арбат, д. 21',
    estimatedDate: '2026-03-12',
  },
  {
    id: 'pickup-cdek-3',
    provider: 'cdek',
    title: 'СДЭК — ПВЗ на Ленинском',
    address: 'Москва, Ленинский проспект, д. 41',
    estimatedDate: '2026-03-12',
  },
];
