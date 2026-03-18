// src/features/admin-posts-banners-management/data/adminPostsBannersStorage.ts
import { INITIAL_ADMIN_MANAGED_BANNERS } from './mockAdminBanners';
import { INITIAL_ADMIN_MANAGED_POSTS } from './mockAdminPosts';

import type {
  AdminManagedBanner,
  AdminManagedPost,
} from '../model/types';

const POSTS_STORAGE_KEY = 'tailly_admin_managed_posts';
const BANNERS_STORAGE_KEY = 'tailly_admin_managed_banners';

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizePost(post: AdminManagedPost): AdminManagedPost {
  const imageUrls = Array.isArray(post.imageUrls)
    ? post.imageUrls.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const coverImageUrl =
    typeof post.coverImageUrl === 'string' && post.coverImageUrl.trim()
      ? post.coverImageUrl
      : imageUrls[0];

  return {
    ...post,
    imageUrls,
    coverImageUrl,
    tags: Array.isArray(post.tags) ? post.tags : [],
  };
}

function normalizeBanner(banner: AdminManagedBanner): AdminManagedBanner {
  return {
    ...banner,
    linkTarget: banner.linkTarget ?? 'home',
  };
}

function sortPosts(posts: AdminManagedPost[]): AdminManagedPost[] {
  return [...posts].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function sortBanners(banners: AdminManagedBanner[]): AdminManagedBanner[] {
  return [...banners].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export function readAdminManagedPosts(): AdminManagedPost[] {
  const posts = safeParseJson<AdminManagedPost[]>(
    localStorage.getItem(POSTS_STORAGE_KEY),
    INITIAL_ADMIN_MANAGED_POSTS,
  );

  return sortPosts(posts.map(normalizePost));
}

export function writeAdminManagedPosts(posts: AdminManagedPost[]): void {
  localStorage.setItem(
    POSTS_STORAGE_KEY,
    JSON.stringify(sortPosts(posts.map(normalizePost))),
  );
}

export function readAdminManagedBanners(): AdminManagedBanner[] {
  const banners = safeParseJson<AdminManagedBanner[]>(
    localStorage.getItem(BANNERS_STORAGE_KEY),
    INITIAL_ADMIN_MANAGED_BANNERS,
  );

  return sortBanners(banners.map(normalizeBanner));
}

export function writeAdminManagedBanners(
  banners: AdminManagedBanner[],
): void {
  localStorage.setItem(
    BANNERS_STORAGE_KEY,
    JSON.stringify(sortBanners(banners.map(normalizeBanner))),
  );
}