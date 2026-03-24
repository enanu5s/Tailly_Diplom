// src/shared/mock-db/migrateLegacy.ts

import { cloneDeep } from './cloneDeep';
import { LEGACY_KEYS } from './constants';

import type { MockDbSnapshot } from './types';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Однократно подтягивает данные из разрозненных ключей localStorage в общий снимок.
 */
export function mergeLegacyLocalStorageIfNeeded(db: MockDbSnapshot): MockDbSnapshot {
  if (typeof window === 'undefined') {
    return db;
  }

  if (db.meta.legacyImported) {
    return db;
  }

  const next = cloneDeep(db);
  next.meta = { ...next.meta, legacyImported: true };

  const specRaw = localStorage.getItem(LEGACY_KEYS.specialists);
  if (specRaw) {
    const parsed = safeParse<unknown>(specRaw, null);
    if (Array.isArray(parsed) && parsed.length > 0) {
      next.specialists.managed = parsed as MockDbSnapshot['specialists']['managed'];
    }
  }

  const softRaw = localStorage.getItem(LEGACY_KEYS.softDelete);
  if (softRaw) {
    const parsed = safeParse<Record<string, unknown>>(softRaw, {});
    if (parsed && typeof parsed === 'object') {
      next.accountDeletion.softDeleteByUserId =
        parsed as MockDbSnapshot['accountDeletion']['softDeleteByUserId'];
    }
  }

  const permRaw = localStorage.getItem(LEGACY_KEYS.permanentUsers);
  if (permRaw) {
    const parsed = safeParse<unknown[]>(permRaw, []);
    if (Array.isArray(parsed)) {
      next.accountDeletion.permanentUserIds = parsed.filter(
        (id): id is string => typeof id === 'string' && id.trim().length > 0,
      );
    }
  }

  const delMailRaw = localStorage.getItem(LEGACY_KEYS.deletionEmails);
  if (delMailRaw) {
    const parsed = safeParse<unknown[]>(delMailRaw, []);
    if (Array.isArray(parsed)) {
      next.accountDeletion.deletionEmailOutbox =
        parsed as MockDbSnapshot['accountDeletion']['deletionEmailOutbox'];
    }
  }

  const svcRaw = localStorage.getItem(LEGACY_KEYS.serviceOrders);
  if (svcRaw) {
    const parsed = safeParse<unknown[]>(svcRaw, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      next.orders.service = parsed as MockDbSnapshot['orders']['service'];
    }
  }

  const shopOrdRaw = localStorage.getItem(LEGACY_KEYS.shopOrders);
  if (shopOrdRaw) {
    const parsed = safeParse<unknown[]>(shopOrdRaw, []);
    if (Array.isArray(parsed)) {
      next.shop.orders = parsed as MockDbSnapshot['shop']['orders'];
    }
  }

  const appRaw = localStorage.getItem(LEGACY_KEYS.applications);
  if (appRaw) {
    const parsed = safeParse<unknown[]>(appRaw, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      next.applications.specialist =
        parsed as MockDbSnapshot['applications']['specialist'];
    }
  }

  const adminPostsRaw = localStorage.getItem(LEGACY_KEYS.adminPosts);
  if (adminPostsRaw) {
    const parsed = safeParse<unknown[]>(adminPostsRaw, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      next.cms.posts = parsed as MockDbSnapshot['cms']['posts'];
    }
  }

  const adminBannersRaw = localStorage.getItem(LEGACY_KEYS.adminBanners);
  if (adminBannersRaw) {
    const parsed = safeParse<unknown[]>(adminBannersRaw, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      next.cms.banners = parsed as MockDbSnapshot['cms']['banners'];
    }
  }

  const msgThreadsRaw = localStorage.getItem(LEGACY_KEYS.messageThreads);
  if (msgThreadsRaw) {
    const parsed = safeParse<unknown[]>(msgThreadsRaw, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      next.messages.threads = parsed as MockDbSnapshot['messages']['threads'];
    }
  }

  const msgItemsRaw = localStorage.getItem(LEGACY_KEYS.messageItems);
  if (msgItemsRaw) {
    const parsed = safeParse<unknown[]>(msgItemsRaw, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      next.messages.items = parsed as MockDbSnapshot['messages']['items'];
    }
  }

  return next;
}
