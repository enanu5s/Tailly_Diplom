//src/features/specialists-search/api/specialistsSearchApi.ts

import type { Specialist } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

/* MOCK */
let MOCK_SPECIALISTS: Specialist[] = [
  {
    id: 'sp-1',
    name: 'Анастасия',
    avatarUrl: '/images/mock/specialists/sp1.jpg',
    city: 'Москва',
    district: 'Центральный административный округ',
    description:
      'Бережно гуляю с собаками любых размеров, умею находить подход даже к тревожным питомцам.',
    rating: 4.9,
    reviewsCount: 27,
    location: { lat: 55.7558, lon: 37.6173 },
    experienceYears: 3,
    services: [
      { serviceId: 'walking', petTypes: ['dog'], priceFrom: 1200 },
      { serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 2500 },
    ],
  },
  {
    id: 'sp-2',
    name: 'Игорь',
    avatarUrl: '/images/mock/specialists/sp2.jpg',
    city: 'Москва',
    district: 'Тверской район',
    description:
      'Петситтер с опытом, люблю активные прогулки. Могу присылать фото и видео-отчёты.',
    rating: 4.7,
    reviewsCount: 14,
    location: { lat: 55.7649, lon: 37.6059 },
    experienceYears: 5,
    services: [
      { serviceId: 'walking', petTypes: ['dog'], priceFrom: 1000 },
      { serviceId: 'boarding', petTypes: ['cat', 'dog', 'other'], priceFrom: 1800 },
    ],
  },
  {
    id: 'sp-3',
    name: 'Мария',
    avatarUrl: null,
    city: 'Москва',
    district: 'Пресненский район',
    description:
      'Дневная передержка, присмотр за кошками, забота и внимание к привычкам питомца.',
    rating: 5,
    reviewsCount: 8,
    location: { lat: 55.7572, lon: 37.5598 },
    experienceYears: 2,
    services: [
      { serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 1500 },
    ],
  },
  {
    id: 'sp-4',
    name: 'Елена',
    avatarUrl: '/images/mock/specialists/sp4.jpg',
    city: 'Тверь',
    district: '',
    description:
      'Спокойно и внимательно отношусь к питомцам, соблюдаю режим прогулок и кормления.',
    rating: 4.8,
    reviewsCount: 19,
    location: { lat: 56.5128, lon: 35.5518 },
    experienceYears: 4,
    services: [
      { serviceId: 'walking', petTypes: ['dog'], priceFrom: 1100 },
      { serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 1700 },
    ],
  },
];

async function mockGetSpecialists(): Promise<Specialist[]> {
  return JSON.parse(JSON.stringify(MOCK_SPECIALISTS)) as Specialist[];
}

/* REAL */
async function realGetSpecialists(): Promise<Specialist[]> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set');
  }

  return fetchJson<Specialist[]>(`${API_BASE_URL}/specialists`, {
    method: 'GET',
  });
}

export const specialistsSearchApi = {
  getSpecialists(): Promise<Specialist[]> {
    return USE_MOCK ? mockGetSpecialists() : realGetSpecialists();
  },
};