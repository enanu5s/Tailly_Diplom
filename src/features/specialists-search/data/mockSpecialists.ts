// src/features/specialists-search/data/mockSpecialists.ts

import { buildDemoSpecialistSpecs } from '@/shared/mock-db/seed/demoDataset.seed';

import type { Specialist } from '../model/types';

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Москва: { lat: 55.7558, lon: 37.6173 },
  'Санкт-Петербург': { lat: 59.9343, lon: 30.3351 },
  Казань: { lat: 55.7887, lon: 49.1221 },
  'Нижний Новгород': { lat: 56.2965, lon: 43.9361 },
  Екатеринбург: { lat: 56.8389, lon: 60.6057 },
  Краснодар: { lat: 45.0355, lon: 38.9753 },
};

const SERVICE_SETS: Specialist['services'][] = [
  [
    { serviceId: 'walking', petTypes: ['dog'], priceFrom: 1200 },
    { serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 2500 },
  ],
  [
    { serviceId: 'walking', petTypes: ['dog'], priceFrom: 1000 },
    { serviceId: 'boarding', petTypes: ['cat', 'dog', 'other'], priceFrom: 1800 },
  ],
  [{ serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 1500 }],
  [
    { serviceId: 'walking', petTypes: ['dog'], priceFrom: 1100 },
    { serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 1700 },
  ],
];

function buildMockSpecialists(): Specialist[] {
  const primary: Specialist = {
    id: 'specialist-1',
    name: 'Мария И.',
    avatarUrl: '/images/mock/specialists/sp3.jpg',
    city: 'Москва',
    district: 'Пресненский район',
    description:
      'Дневная передержка, присмотр за кошками, забота и внимание к привычкам питомца.',
    rating: 5,
    reviewsCount: 18,
    location: { lat: 55.7572, lon: 37.5598 },
    experienceYears: 5,
    services: [
      { serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 1500 },
      { serviceId: 'walking', petTypes: ['dog'], priceFrom: 900 },
    ],
  };

  const specs = buildDemoSpecialistSpecs();

  const synthetic: Specialist[] = specs.map((s) => {
    const loc = CITY_COORDS[s.city] ?? CITY_COORDS['Москва'];
    const jitter = s.index * 0.012;
    const services = SERVICE_SETS[s.index % SERVICE_SETS.length] ?? SERVICE_SETS[0];

    return {
      id: `specialist-${s.index}`,
      name: `${s.firstName} ${s.lastName[0] ?? ''}.`,
      avatarUrl: s.index % 3 === 0 ? '/images/mock/specialists/sp1.jpg' : null,
      city: s.city,
      district: s.city === 'Москва' ? 'В пределах МКАД' : '',
      description: s.about,
      rating: Math.min(5, 4.3 + (s.index % 7) * 0.1),
      reviewsCount: 4 + s.index * 2,
      experienceYears: 2 + (s.index % 6),
      location: { lat: loc.lat + jitter, lon: loc.lon + jitter },
      services,
    };
  });

  return [primary, ...synthetic];
}

export const MOCK_SPECIALISTS: Specialist[] = buildMockSpecialists();

export function cloneSpecialists(): Specialist[] {
  return JSON.parse(JSON.stringify(MOCK_SPECIALISTS)) as Specialist[];
}
