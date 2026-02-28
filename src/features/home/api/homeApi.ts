//src/features/home/api/homeApi.ts

import type { HomeBanner, HomeReview, HomeService } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function deepCopy<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* MOCK */
const MOCK_BANNERS: HomeBanner[] = [
  {
    id: 'bn-1',
    title: 'Скидка 15% на первый выгул',
    subtitle: 'Только до конца недели',
    imageUrl: '/images/home/banner-walk.png',
    createdAtIso: '2026-02-20T10:00:00.000Z',
    newsId: 'news-101',
  },
  {
    id: 'bn-2',
    title: 'Проверенные специалисты рядом',
    subtitle: 'Профили, отзывы, услуги',
    imageUrl: '/images/home/banner-sitters.png',
    createdAtIso: '2026-02-18T10:00:00.000Z',
    newsId: 'news-102',
  },
];

const MOCK_SERVICES: HomeService[] = [
  { id: 'walk', title: 'Выгул', subtitle: 'Пешие прогулки и активность', iconUrl: '/images/home/s-walk.png' },
  { id: 'boarding', title: 'Передержка', subtitle: 'Забота на время отъезда', iconUrl: '/images/home/s-boarding.png' },
  { id: 'grooming', title: 'Груминг', subtitle: 'Стрижка, мытьё, уход', iconUrl: '/images/home/s-grooming.png' },
  { id: 'training', title: 'Тренировки', subtitle: 'Базовые команды и привычки', iconUrl: '/images/home/s-training.png' },
  { id: 'photoshoot', title: 'Фотосессия', subtitle: 'Памятные кадры с питомцем', iconUrl: '/images/home/s-photoshoot.png' },
];

const MOCK_REVIEWS: HomeReview[] = [
  {
    id: 'rv-1',
    createdAtIso: '2026-02-23T12:00:00.000Z',
    rating: 5,
    text: 'Очень внимательный специалист! Ричи вернулся довольный, прогулка была отличной.',
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
    text: 'Передержка прошла идеально. Получали фото каждый день, всё спокойно и безопасно.',
    petName: 'Мия',
    ownerName: 'Мария К.',
    sitterId: 's-2',
    sitterName: 'Сергей',
    serviceTitle: 'Передержка',
    photoUrls: [],
  },
];

async function mockGetLatestBanners(): Promise<HomeBanner[]> {
  const sorted = [...MOCK_BANNERS].sort((a, b) => (a.createdAtIso < b.createdAtIso ? 1 : -1));
  return deepCopy(sorted.slice(0, 6));
}

async function mockGetServices(): Promise<HomeService[]> {
  return deepCopy(MOCK_SERVICES);
}

// “свежие” + только 5 звёзд. Свежесть: последние 30 дней (mock-логика)
async function mockGetTopReviews(): Promise<HomeReview[]> {
  const now = Date.now();
  const days30 = 30 * 24 * 60 * 60 * 1000;

  const filtered = MOCK_REVIEWS.filter((r) => {
    const t = new Date(r.createdAtIso).getTime();
    return r.rating === 5 && now - t <= days30;
  });

  const sorted = filtered.sort((a, b) => (a.createdAtIso < b.createdAtIso ? 1 : -1));
  return deepCopy(sorted.slice(0, 5));
}

/* REAL */
async function realGetLatestBanners(): Promise<HomeBanner[]> {
  // сервер: последние 6 по createdAt
  return fetchJson<HomeBanner[]>(`${API_BASE_URL}/home/banners?limit=6`);
}

async function realGetServices(): Promise<HomeService[]> {
  return fetchJson<HomeService[]>(`${API_BASE_URL}/services`);
}

async function realGetTopReviews(): Promise<HomeReview[]> {
  // сервер: только рейтинг=5 и свежие, лимит 5
  return fetchJson<HomeReview[]>(`${API_BASE_URL}/home/reviews?rating=5&freshDays=30&limit=5`);
}

export const homeApi = {
  getLatestBanners: () => (USE_MOCK ? mockGetLatestBanners() : realGetLatestBanners()),
  getServices: () => (USE_MOCK ? mockGetServices() : realGetServices()),
  getTopReviews: () => (USE_MOCK ? mockGetTopReviews() : realGetTopReviews()),
};