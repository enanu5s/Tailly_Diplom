// src/features/admin-posts-banners-management/api/adminPostsBannersManagementApi.mock.ts
import {
  readAdminManagedBanners,
  readAdminManagedPosts,
  writeAdminManagedBanners,
  writeAdminManagedPosts,
} from '../data/adminPostsBannersStorage';
import { AdminPostsBannersManagementError } from '../model/types';
import type {
  AdminManagedBanner,
  AdminManagedPost,
  AdminPostsBannersResponse,
  BannerLinkTarget,
  SaveAdminBannerPayload,
  SaveAdminPostPayload,
} from '../model/types';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function normalizeImageUrls(imageUrls: string[]): string[] {
  return imageUrls.map((item) => item.trim()).filter(Boolean);
}

function resolveBannerLinkUrl(target: BannerLinkTarget): string {
  switch (target) {
    case 'home':
      return '/';
    case 'posts':
      return '/posts';
    case 'specialists':
      return '/specialists';
    case 'shop':
      return '/shop';
    case 'profile':
      return '/profile';
    default:
      return '/';
  }
}

export async function mockGetAdminPostsBanners(): Promise<AdminPostsBannersResponse> {
  return {
    posts: readAdminManagedPosts(),
    banners: readAdminManagedBanners(),
  };
}

export async function mockSaveAdminPost(
  payload: SaveAdminPostPayload,
): Promise<AdminManagedPost> {
  const title = payload.title.trim();
  const content = payload.content.trim();
  const imageUrls = normalizeImageUrls(payload.imageUrls);
  const coverImageUrl = normalizeOptionalString(payload.coverImageUrl);

  if (!title) {
    throw new AdminPostsBannersManagementError('Укажите заголовок публикации.');
  }

  if (!content) {
    throw new AdminPostsBannersManagementError('Укажите текст публикации.');
  }

  if (coverImageUrl && !imageUrls.includes(coverImageUrl)) {
    throw new AdminPostsBannersManagementError(
      'Обложка должна быть выбрана из загруженных изображений.',
    );
  }

  const posts = readAdminManagedPosts();
  const nowIso = new Date().toISOString();

  const nextPost: AdminManagedPost = payload.id
    ? (() => {
        const existingPost = posts.find((post) => post.id === payload.id);

        if (!existingPost) {
          throw new AdminPostsBannersManagementError(
            'Публикация для редактирования не найдена.',
          );
        }

        const nextStatus = payload.status;

        return {
          ...existingPost,
          title,
          content,
          imageUrls,
          coverImageUrl,
          tags: payload.tags,
          status: nextStatus,
          publishedAt:
            nextStatus === 'published'
              ? existingPost.publishedAt ?? nowIso
              : existingPost.publishedAt,
          updatedAt: nowIso,
        };
      })()
    : {
        id: createId('admin-post'),
        title,
        content,
        imageUrls,
        coverImageUrl,
        tags: payload.tags,
        status: payload.status,
        publishedAt: payload.status === 'published' ? nowIso : undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

  const updatedPosts = payload.id
    ? posts.map((post) => (post.id === nextPost.id ? nextPost : post))
    : [nextPost, ...posts];

  writeAdminManagedPosts(updatedPosts);

  return nextPost;
}

export async function mockDeleteAdminPost(postId: string): Promise<void> {
  const posts = readAdminManagedPosts();
  const nextPosts = posts.filter((post) => post.id !== postId);

  if (nextPosts.length === posts.length) {
    throw new AdminPostsBannersManagementError('Публикация не найдена.');
  }

  writeAdminManagedPosts(nextPosts);
}

export async function mockSaveAdminBanner(
  payload: SaveAdminBannerPayload,
): Promise<AdminManagedBanner> {
  const title = payload.title.trim();
  const description = payload.description.trim();

  if (!title) {
    throw new AdminPostsBannersManagementError('Укажите название баннера.');
  }

  if (!description) {
    throw new AdminPostsBannersManagementError('Укажите описание баннера.');
  }

  const banners = readAdminManagedBanners();
  const nowIso = new Date().toISOString();

  const nextBanner: AdminManagedBanner = payload.id
    ? (() => {
        const existingBanner = banners.find(
          (banner) => banner.id === payload.id,
        );

        if (!existingBanner) {
          throw new AdminPostsBannersManagementError(
            'Баннер для редактирования не найден.',
          );
        }

        return {
          ...existingBanner,
          title,
          description,
          imageUrl: normalizeOptionalString(payload.imageUrl),
          linkTarget: payload.linkTarget,
          linkUrl: resolveBannerLinkUrl(payload.linkTarget),
          placement: payload.placement,
          status: payload.status,
          startsAt: normalizeOptionalString(payload.startsAt),
          endsAt: normalizeOptionalString(payload.endsAt),
          updatedAt: nowIso,
        };
      })()
    : {
        id: createId('banner'),
        title,
        description,
        imageUrl: normalizeOptionalString(payload.imageUrl),
        linkTarget: payload.linkTarget,
        linkUrl: resolveBannerLinkUrl(payload.linkTarget),
        placement: payload.placement,
        status: payload.status,
        startsAt: normalizeOptionalString(payload.startsAt),
        endsAt: normalizeOptionalString(payload.endsAt),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

  const updatedBanners = payload.id
    ? banners.map((banner) => (banner.id === nextBanner.id ? nextBanner : banner))
    : [nextBanner, ...banners];

  writeAdminManagedBanners(updatedBanners);

  return nextBanner;
}

export async function mockDeleteAdminBanner(bannerId: string): Promise<void> {
  const banners = readAdminManagedBanners();
  const nextBanners = banners.filter((banner) => banner.id !== bannerId);

  if (nextBanners.length === banners.length) {
    throw new AdminPostsBannersManagementError('Баннер не найден.');
  }

  writeAdminManagedBanners(nextBanners);
}