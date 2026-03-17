// src/features/home/api/homeApi.mock.ts

import { SERVICES } from '@/shared/config/services';
import type { ServiceConfig } from '@/shared/config/services';

import { postsApi } from '@/features/posts/api/postsApi';
import type { Post } from '@/features/posts/model/types';

import type { HomeBanner, HomeReview } from '../model/types';

import { deepCopy, MOCK_REVIEWS } from '../data/mockHome';

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

export async function mockGetLatestBanners(): Promise<HomeBanner[]> {
  const latestPosts = await postsApi.getLatestPosts(5);
  const banners = latestPosts.map(mapPostToBanner);

  return deepCopy(banners);
}

export async function mockGetServices(): Promise<ServiceConfig[]> {
  return deepCopy(SERVICES);
}

export async function mockGetTopReviews(): Promise<HomeReview[]> {
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