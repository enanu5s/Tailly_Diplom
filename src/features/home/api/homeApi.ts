// src/features/home/api/homeApi.ts

import { SERVICES } from '@/shared/config/services';
import type { ServiceConfig } from '@/shared/config/services';

import { postsApi } from '@/features/posts/api/postsApi';
import type { Post } from '@/features/posts/model/types';

import type { HomeBanner, HomeReview } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error((await response.text().catch(() => '')) || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

function buildBannerSubtitle(content: string, maxLength = 120): string {
  const normalized = content.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return '';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

function mapPostToBanner(post: Post): HomeBanner {
  return {
    id: `post-banner-${post.id}`,
    title: post.title,
    subtitle: buildBannerSubtitle(post.content),
    imageUrl: post.imageUrl,
    createdAtIso: post.publishedAt,
    postId: post.id,
  };
}

/* ================= MOCK ================= */

const MOCK_REVIEWS: HomeReview[] = [
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

async function mockGetLatestBanners(): Promise<HomeBanner[]> {
  const latestPosts = await postsApi.getLatestPosts(5);
  const banners = latestPosts.map(mapPostToBanner);

  return deepCopy(banners);
}

async function mockGetServices(): Promise<ServiceConfig[]> {
  return deepCopy(SERVICES);
}

async function mockGetTopReviews(): Promise<HomeReview[]> {
  const now = Date.now();
  const days30 = 30 * 24 * 60 * 60 * 1000;

  const filtered = MOCK_REVIEWS.filter((review) => {
    const time = new Date(review.createdAtIso).getTime();
    return review.rating === 5 && now - time <= days30;
  });

  const sorted = filtered.sort((a, b) =>
    a.createdAtIso < b.createdAtIso ? 1 : -1,
  );

  return deepCopy(sorted.slice(0, 5));
}

/* ================= REAL ================= */

async function realGetLatestBanners(): Promise<HomeBanner[]> {
  const latestPosts = await postsApi.getLatestPosts(5);
  return latestPosts.map(mapPostToBanner);
}

async function realGetServices(): Promise<ServiceConfig[]> {
  return fetchJson<ServiceConfig[]>(`${API_BASE_URL}/services`);
}

async function realGetTopReviews(): Promise<HomeReview[]> {
  return fetchJson<HomeReview[]>(
    `${API_BASE_URL}/home/reviews?rating=5&freshDays=30&limit=5`,
  );
}

export type HomeService = ServiceConfig;

export const homeApi = {
  getLatestBanners: () => (USE_MOCK ? mockGetLatestBanners() : realGetLatestBanners()),
  getServices: () => (USE_MOCK ? mockGetServices() : realGetServices()),
  getTopReviews: () => (USE_MOCK ? mockGetTopReviews() : realGetTopReviews()),
};