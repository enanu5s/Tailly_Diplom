// src/features/admin-posts-banners-management/api/adminPostsBannersManagementApi.ts
import { isMockApiMode } from '@/shared/config/env';

import {
  mockDeleteAdminBanner,
  mockDeleteAdminPost,
  mockGetAdminPostsBanners,
  mockSaveAdminBanner,
  mockSaveAdminPost,
} from './adminPostsBannersManagementApi.mock';

import type {
  AdminManagedBanner,
  AdminManagedPost,
  AdminPostsBannersResponse,
  SaveAdminBannerPayload,
  SaveAdminPostPayload,
} from '../model/types';

async function getRequest() {
  const httpModule = await import('@/shared/api/http');

  if ('request' in httpModule && typeof httpModule.request === 'function') {
    return httpModule.request;
  }

  throw new Error('В "@/shared/api/http" не найден export "request".');
}

async function realGetAdminPostsBanners(): Promise<AdminPostsBannersResponse> {
  const request = await getRequest();

  return request('/admin/content');
}

async function realSaveAdminPost(
  payload: SaveAdminPostPayload,
): Promise<AdminManagedPost> {
  const request = await getRequest();

  if (payload.id) {
    return request(`/admin/content/posts/${encodeURIComponent(payload.id)}`, {
      method: 'PUT',
      body: payload,
    });
  }

  return request('/admin/content/posts', {
    method: 'POST',
    body: payload,
  });
}

async function realDeleteAdminPost(postId: string): Promise<void> {
  const request = await getRequest();

  await request(`/admin/content/posts/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });
}

async function realSaveAdminBanner(
  payload: SaveAdminBannerPayload,
): Promise<AdminManagedBanner> {
  const request = await getRequest();

  if (payload.id) {
    return request(`/admin/content/banners/${encodeURIComponent(payload.id)}`, {
      method: 'PUT',
      body: payload,
    });
  }

  return request('/admin/content/banners', {
    method: 'POST',
    body: payload,
  });
}

async function realDeleteAdminBanner(bannerId: string): Promise<void> {
  const request = await getRequest();

  await request(`/admin/content/banners/${encodeURIComponent(bannerId)}`, {
    method: 'DELETE',
  });
}

export const adminPostsBannersManagementApi = {
  getContent(): Promise<AdminPostsBannersResponse> {
    return isMockApiMode ? mockGetAdminPostsBanners() : realGetAdminPostsBanners();
  },

  savePost(payload: SaveAdminPostPayload): Promise<AdminManagedPost> {
    return isMockApiMode ? mockSaveAdminPost(payload) : realSaveAdminPost(payload);
  },

  deletePost(postId: string): Promise<void> {
    return isMockApiMode ? mockDeleteAdminPost(postId) : realDeleteAdminPost(postId);
  },

  saveBanner(payload: SaveAdminBannerPayload): Promise<AdminManagedBanner> {
    return isMockApiMode ? mockSaveAdminBanner(payload) : realSaveAdminBanner(payload);
  },

  deleteBanner(bannerId: string): Promise<void> {
    return isMockApiMode
      ? mockDeleteAdminBanner(bannerId)
      : realDeleteAdminBanner(bannerId);
  },
};
