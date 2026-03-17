// src/features/home/api/homeApi.ts

import { request } from '@/shared/api/http';
import type { ServiceConfig } from '@/shared/config/services';

import { postsApi } from '@/features/posts/api/postsApi';
import type { Post } from '@/features/posts/model/types';

import {
  mockGetLatestBanners,
  mockGetServices,
  mockGetTopReviews,
} from './homeApi.mock';

import type { HomeBanner, HomeReview } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

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

async function realGetLatestBanners(): Promise<HomeBanner[]> {
  const latestPosts = await postsApi.getLatestPosts(5);
  return latestPosts.map(mapPostToBanner);
}

async function realGetServices(): Promise<ServiceConfig[]> {
  return request<ServiceConfig[]>('/services');
}

async function realGetTopReviews(): Promise<HomeReview[]> {
  return request<HomeReview[]>('/home/reviews', {
    query: {
      rating: 5,
      freshDays: 30,
      limit: 5,
    },
  });
}

export type HomeService = ServiceConfig;

export const homeApi = {
  getLatestBanners: () =>
    USE_MOCK ? mockGetLatestBanners() : realGetLatestBanners(),

  getServices: () => (USE_MOCK ? mockGetServices() : realGetServices()),

  getTopReviews: () => (USE_MOCK ? mockGetTopReviews() : realGetTopReviews()),
};