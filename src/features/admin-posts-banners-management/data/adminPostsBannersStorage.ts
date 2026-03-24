// src/features/admin-posts-banners-management/data/adminPostsBannersStorage.ts
import { INITIAL_ADMIN_MANAGED_BANNERS } from './mockAdminBanners';
import { INITIAL_ADMIN_MANAGED_POSTS } from './mockAdminPosts';

import type { AdminManagedBanner, AdminManagedPost } from '../model/types';

const POSTS_STORAGE_KEY = 'tailly_admin_managed_posts';
const BANNERS_STORAGE_KEY = 'tailly_admin_managed_banners';

const POSTS_IDB_NAME = 'tailly_admin_posts';
const POSTS_IDB_VERSION = 1;
const POSTS_IDB_STORE = 'kv';

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

function openPostsIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB недоступен в этом окружении.'));
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
    const request = store.get(POSTS_STORAGE_KEY);

    request.onerror = () => {
      reject(request.error ?? new Error('Не удалось прочитать посты.'));
    };

    request.onsuccess = () => {
      const value = request.result as AdminManagedPost[] | undefined;
      resolve(value);
    };
  });
}

function idbPutPosts(db: IDBDatabase, posts: AdminManagedPost[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(POSTS_IDB_STORE, 'readwrite');
    const store = transaction.objectStore(POSTS_IDB_STORE);

    transaction.onerror = () => {
      reject(transaction.error ?? new Error('Не удалось сохранить посты.'));
    };

    transaction.oncomplete = () => {
      resolve();
    };

    store.put(posts, POSTS_STORAGE_KEY);
  });
}

function clearLegacyPostsLocalStorage(): void {
  try {
    localStorage.removeItem(POSTS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export async function readAdminManagedPosts(): Promise<AdminManagedPost[]> {
  let db: IDBDatabase;

  try {
    db = await openPostsIdb();
  } catch {
    const legacy = safeParseJson<AdminManagedPost[]>(
      localStorage.getItem(POSTS_STORAGE_KEY),
      INITIAL_ADMIN_MANAGED_POSTS,
    );

    return sortPosts(legacy.map(normalizePost));
  }

  try {
    const fromIdb = await idbGetPosts(db);

    if (fromIdb !== undefined) {
      clearLegacyPostsLocalStorage();
      return sortPosts(fromIdb.map(normalizePost));
    }

    const legacyRaw = localStorage.getItem(POSTS_STORAGE_KEY);

    if (legacyRaw) {
      const legacy = safeParseJson<AdminManagedPost[]>(
        legacyRaw,
        INITIAL_ADMIN_MANAGED_POSTS,
      );
      const normalized = sortPosts(legacy.map(normalizePost));

      await idbPutPosts(db, normalized);
      clearLegacyPostsLocalStorage();
      return normalized;
    }

    return sortPosts(INITIAL_ADMIN_MANAGED_POSTS.map(normalizePost));
  } finally {
    db.close();
  }
}

export async function writeAdminManagedPosts(posts: AdminManagedPost[]): Promise<void> {
  const payload = sortPosts(posts.map(normalizePost));
  let db: IDBDatabase;

  try {
    db = await openPostsIdb();
  } catch {
    try {
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'QuotaExceededError'
          ? 'Недостаточно места в браузере для сохранения публикаций с изображениями. Очистите данные сайта или используйте ссылки на картинки вместо загрузки файлов.'
          : 'Не удалось сохранить публикации в локальном хранилище.';
      throw new Error(message);
    }

    return;
  }

  try {
    await idbPutPosts(db, payload);
    clearLegacyPostsLocalStorage();
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'Недостаточно места в браузере для сохранения публикаций.'
        : error instanceof Error
          ? error.message
          : 'Не удалось сохранить публикации.';
    throw new Error(message);
  } finally {
    db.close();
  }
}

export function readAdminManagedBanners(): AdminManagedBanner[] {
  const banners = safeParseJson<AdminManagedBanner[]>(
    localStorage.getItem(BANNERS_STORAGE_KEY),
    INITIAL_ADMIN_MANAGED_BANNERS,
  );

  return sortBanners(banners.map(normalizeBanner));
}

export function writeAdminManagedBanners(banners: AdminManagedBanner[]): void {
  localStorage.setItem(
    BANNERS_STORAGE_KEY,
    JSON.stringify(sortBanners(banners.map(normalizeBanner))),
  );
}
