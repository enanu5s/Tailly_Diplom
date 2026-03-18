// src/features/admin-posts-banners-management/service/adminPostsBannersManagementService.ts
import { adminPostsBannersManagementApi } from '../api/adminPostsBannersManagementApi';

import type {
  AdminManagedBanner,
  AdminManagedPost,
  AdminPostsBannersResponse,
  SaveAdminBannerPayload,
  SaveAdminPostPayload,
} from '../model/types';

export const adminPostsBannersManagementService = {
  getContent(): Promise<AdminPostsBannersResponse> {
    return adminPostsBannersManagementApi.getContent();
  },

  savePost(payload: SaveAdminPostPayload): Promise<AdminManagedPost> {
    return adminPostsBannersManagementApi.savePost(payload);
  },

  deletePost(postId: string): Promise<void> {
    return adminPostsBannersManagementApi.deletePost(postId);
  },

  saveBanner(payload: SaveAdminBannerPayload): Promise<AdminManagedBanner> {
    return adminPostsBannersManagementApi.saveBanner(payload);
  },

  deleteBanner(bannerId: string): Promise<void> {
    return adminPostsBannersManagementApi.deleteBanner(bannerId);
  },
};