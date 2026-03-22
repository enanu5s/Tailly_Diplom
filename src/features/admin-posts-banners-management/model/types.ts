// src/features/admin-posts-banners-management/model/types.ts
export type AdminPostStatus = 'draft' | 'published' | 'archived';

export type BannerPlacement =
  | 'home_hero'
  | 'posts'
  | 'specialists'
  | 'shop';

export type AdminBannerStatus = 'draft' | 'published' | 'archived';

export type BannerLinkTarget =
  | 'home'
  | 'posts'
  | 'specialists'
  | 'shop'
  | 'profile';

export type AdminManagedPost = {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  coverImageUrl?: string;
  tags: string[];
  status: AdminPostStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminManagedBanner = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTarget: BannerLinkTarget;
  linkedPostId?: string;
  placement: BannerPlacement;
  status: AdminBannerStatus;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPostsBannersResponse = {
  posts: AdminManagedPost[];
  banners: AdminManagedBanner[];
};

export type SaveAdminPostPayload = {
  id?: string;
  title: string;
  content: string;
  imageUrls: string[];
  coverImageUrl?: string;
  tags: string[];
  status: AdminPostStatus;
};

export type SaveAdminBannerPayload = {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  placement: BannerPlacement;
  linkTarget: BannerLinkTarget;
  linkedPostId?: string;
  status: AdminBannerStatus;
  startsAt?: string;
  endsAt?: string;
};

export class AdminPostsBannersManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminPostsBannersManagementError';
  }
}