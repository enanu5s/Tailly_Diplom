// src/features/admin-posts-banners-management/api/adminPostsBannersManagementApi.ts
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

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

void API_BASE_URL;

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
    return USE_MOCK ? mockGetAdminPostsBanners() : realGetAdminPostsBanners();
  },

  savePost(payload: SaveAdminPostPayload): Promise<AdminManagedPost> {
    return USE_MOCK ? mockSaveAdminPost(payload) : realSaveAdminPost(payload);
  },

  deletePost(postId: string): Promise<void> {
    return USE_MOCK ? mockDeleteAdminPost(postId) : realDeleteAdminPost(postId);
  },

  saveBanner(payload: SaveAdminBannerPayload): Promise<AdminManagedBanner> {
    return USE_MOCK
      ? mockSaveAdminBanner(payload)
      : realSaveAdminBanner(payload);
  },

  deleteBanner(bannerId: string): Promise<void> {
    return USE_MOCK
      ? mockDeleteAdminBanner(bannerId)
      : realDeleteAdminBanner(bannerId);
  },
};