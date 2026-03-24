// src/features/admin-posts-banners-management/data/adminPostsBannersStorage.ts
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type { AdminManagedBanner, AdminManagedPost } from '../model/types';

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
  const normalizedLinkTarget = banner.linkTarget ?? 'home';
  const normalizedLinkedPostId =
    normalizedLinkTarget === 'posts' &&
    typeof banner.linkedPostId === 'string' &&
    banner.linkedPostId.trim()
      ? banner.linkedPostId
      : undefined;

  return {
    ...banner,
    linkTarget: normalizedLinkTarget,
    linkedPostId: normalizedLinkedPostId,
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

export async function readAdminManagedPosts(): Promise<AdminManagedPost[]> {
  ensureMockDatabaseLoaded();
  const raw = unsafeMutableMockDb().cms.posts;
  return sortPosts(raw.map(normalizePost));
}

export async function writeAdminManagedPosts(posts: AdminManagedPost[]): Promise<void> {
  const payload = sortPosts(posts.map(normalizePost));

  try {
    patchMockDatabase((db) => {
      db.cms.posts = payload;
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'Недостаточно места в браузере для сохранения публикаций. Очистите данные сайта или уменьшите объём изображений.'
        : error instanceof Error
          ? error.message
          : 'Не удалось сохранить публикации.';
    throw new Error(message);
  }
}

export function readAdminManagedBanners(): AdminManagedBanner[] {
  ensureMockDatabaseLoaded();
  const raw = unsafeMutableMockDb().cms.banners;
  return sortBanners(raw.map(normalizeBanner));
}

export function writeAdminManagedBanners(banners: AdminManagedBanner[]): void {
  const payload = sortBanners(banners.map(normalizeBanner));

  try {
    patchMockDatabase((db) => {
      db.cms.banners = payload;
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'Недостаточно места в браузере для сохранения баннеров.'
        : error instanceof Error
          ? error.message
          : 'Не удалось сохранить баннеры.';
    throw new Error(message);
  }
}

const POSTS_IDB_NAME = 'tailly_admin_posts';
const POSTS_IDB_VERSION = 1;
const POSTS_IDB_STORE = 'kv';
const POSTS_LEGACY_STORAGE_KEY = 'tailly_admin_managed_posts';

function openPostsIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB недоступен.'));
      return;
    }

    const request = indexedDB.open(POSTS_IDB_NAME, POSTS_IDB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Не удалось открыть хранилище постов.'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(POSTS_IDB_STORE)) {
        db.createObjectStore(POSTS_IDB_STORE);
      }
    };
  });
}

function idbGetPosts(db: IDBDatabase): Promise<AdminManagedPost[] | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(POSTS_IDB_STORE, 'readonly');
    const store = transaction.objectStore(POSTS_IDB_STORE);
    const request = store.get(POSTS_LEGACY_STORAGE_KEY);

    request.onerror = () => {
      reject(request.error ?? new Error('Не удалось прочитать посты из IDB.'));
    };

    request.onsuccess = () => {
      resolve(request.result as AdminManagedPost[] | undefined);
    };
  });
}

/** Однократный перенос постов из старого IndexedDB в общую mock-db (до этого посты жили только в IDB). */
export async function migrateAdminPostsFromIndexedDbOnce(): Promise<void> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return;
  }

  ensureMockDatabaseLoaded();

  let db: IDBDatabase;

  try {
    db = await openPostsIdb();
  } catch {
    return;
  }

  try {
    const fromIdb = await idbGetPosts(db);

    if (!fromIdb || fromIdb.length === 0) {
      return;
    }

    patchMockDatabase((snap) => {
      snap.cms.posts = sortPosts(fromIdb.map(normalizePost));
    });

    try {
      localStorage.removeItem(POSTS_LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  } catch {
    /* чтение IDB не удалось */
  } finally {
    db.close();
  }
}
