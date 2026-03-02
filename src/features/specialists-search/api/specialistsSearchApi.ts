import type { Specialist } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* MOCK */
let MOCK_SPECIALISTS: Specialist[] = [
  {
    id: 'sp-1',
    name: 'Анастасия',
    avatarUrl: '/images/mock/specialists/sp1.jpg',
    city: 'Рига',
    district: 'Центр',
    description:
      'Бережно гуляю с собаками любых размеров, умею находить подход даже к тревожным питомцам.',
    rating: 4.9,
    reviewsCount: 27,
    location: { lat: 56.9496, lon: 24.1052 },
    experienceYears: 3,
    services: [
      { serviceId: 'walking', petTypes: ['dog'], priceFrom: 12 },
      { serviceId: 'boarding', petTypes: ['cat', 'dog'], priceFrom: 25 },
    ],
  },
  {
    id: 'sp-2',
    name: 'Игорь',
    avatarUrl: '/images/mock/specialists/sp2.jpg',
    city: 'Рига',
    district: 'Пурвциемс',
    description: 'Петситтер с опытом, люблю активные прогулки. Могу присылать фото/видео отчёты.',
    rating: 4.7,
    reviewsCount: 14,
    location: { lat: 56.9705, lon: 24.1815 },
    experienceYears: 5,
    services: [{ serviceId: 'walking', petTypes: ['dog'], priceFrom: 10 }],
  },
  {
    id: 'sp-3',
    name: 'Мария',
    avatarUrl: null,
    city: 'Юрмала',
    district: 'Майори',
    description: 'Дневная передержка, присмотр за кошками, забота и внимание к привычкам питомца.',
    rating: 5.0,
    reviewsCount: 8,
    location: { lat: 56.968, lon: 23.77 },
    experienceYears: 2,
    services: [{ serviceId: 'walking', petTypes: ['cat'], priceFrom: 18 }],
  },
];

async function mockGetSpecialists(): Promise<Specialist[]> {
  return JSON.parse(JSON.stringify(MOCK_SPECIALISTS)) as Specialist[];
}

/* REAL */
async function realGetSpecialists(): Promise<Specialist[]> {
  return fetchJson<Specialist[]>(`${API_BASE_URL}/specialists`);
}

export const specialistsSearchApi = {
  getSpecialists: () => (USE_MOCK ? mockGetSpecialists() : realGetSpecialists()),
};