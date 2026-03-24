import { readAdminManagedBanners } from '@/features/admin-posts-banners-management/data/adminPostsBannersStorage';
import type { AdminManagedBanner } from '@/features/admin-posts-banners-management/model/types';
import { SERVICES } from '@/shared/config/services';
import type { ServiceConfig } from '@/shared/config/services';

import { deepCopy, MOCK_REVIEWS } from '../data/mockHome';
import { getHomeFeaturedReviewsForCurrentDay } from '../lib/homeFeaturedReviewsDayCache';
import { selectHomeFeaturedReviews } from '../lib/selectHomeFeaturedReviews';

import type { HomeBanner, HomeReview } from '../model/types';

function mapAdminBannerToHomeBanner(banner: AdminManagedBanner): HomeBanner {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.description,
    imageUrl: banner.imageUrl,
    createdAtIso: banner.createdAt,
    postId: banner.linkedPostId,
    linkUrl: banner.linkUrl,
  };
}

export async function mockGetLatestBanners(): Promise<HomeBanner[]> {
  const allBanners = readAdminManagedBanners();

  const filtered = allBanners
    .filter((b) => b.status === 'published' && b.placement === 'home_hero')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map(mapAdminBannerToHomeBanner);

  return deepCopy(filtered);
}

export async function mockGetServices(): Promise<ServiceConfig[]> {
  return deepCopy(SERVICES);
}

export async function mockGetTopReviews(): Promise<HomeReview[]> {
  return getHomeFeaturedReviewsForCurrentDay(() =>
    selectHomeFeaturedReviews(MOCK_REVIEWS, 5),
  );
}
