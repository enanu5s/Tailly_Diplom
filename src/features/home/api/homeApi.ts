// src/features/home/api/homeApi.ts

import { postsApi } from '@/features/posts/api/postsApi';
import type { Post } from '@/features/posts/model/types';
import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';
import type { ServiceConfig } from '@/shared/config/services';
import { mockDataSourceStore } from '@/shared/lib/mock/mockDataSourceStore';

import { mockGetLatestBanners, mockGetServices, mockGetTopReviews } from './homeApi.mock';

import type { HomeBanner, HomeReview } from '../model/types';

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
      limit: 5,
      /** Пять последних с фото и достаточным текстом; снимок на стороне API обновляется раз в сутки. */
      requirePhotos: true,
      minTextLength: 80,
      minWords: 8,
    },
  });
}

function isEndpointMissing(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404;
}

export type HomeService = ServiceConfig;

export const homeApi = {
  getLatestBanners: () =>
    isMockApiMode ? mockGetLatestBanners() : realGetLatestBanners(),

  async getServices() {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('home/services', true);
      return mockGetServices();
    }

    try {
      const data = await realGetServices();
      mockDataSourceStore.setSource('home/services', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('home/services', true);
        return mockGetServices();
      }

      throw error;
    }
  },

  async getTopReviews() {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('home/reviews', true);
      return mockGetTopReviews();
    }

    try {
      const data = await realGetTopReviews();
      mockDataSourceStore.setSource('home/reviews', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('home/reviews', true);
        return mockGetTopReviews();
      }

      throw error;
    }
  },
};
