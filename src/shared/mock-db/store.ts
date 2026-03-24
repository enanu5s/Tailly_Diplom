// src/shared/mock-db/store.ts

import { buildInitialSnapshot } from './buildInitialSnapshot';
import { cloneDeep } from './cloneDeep';
import { MOCK_DB_STORAGE_KEY, MOCK_DB_VERSION } from './constants';
import {
  mergeLegacyLocalStorageIfNeeded,
  normalizeSnapshotVersion,
} from './migrateLegacy';

import type { MockDbSnapshot } from './types';

let internal: MockDbSnapshot | null = null;

const listeners = new Set<() => void>();

function persistSnapshot(snapshot: MockDbSnapshot): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* квота / приватный режим */
  }
}

function persist(): void {
  if (!internal) {
    return;
  }

  persistSnapshot(internal);
}

function emit(): void {
  listeners.forEach((fn) => {
    fn();
  });
}

function loadOrCreate(): MockDbSnapshot {
  if (typeof window === 'undefined') {
    return buildInitialSnapshot();
  }

  try {
    const raw = localStorage.getItem(MOCK_DB_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeSnapshotVersion(parsed);

      if (normalized) {
        const merged = mergeLegacyLocalStorageIfNeeded(normalized);
        persistSnapshot(merged);
        return merged;
      }
    }
  } catch {
    /* fallthrough */
  }

  const fresh = buildInitialSnapshot();
  const mergedFresh = mergeLegacyLocalStorageIfNeeded(fresh);
  persistSnapshot(mergedFresh);
  return mergedFresh;
}

/**
 * Вызывать при старте приложения в mock-режиме.
 */
export function ensureMockDatabaseLoaded(): void {
  if (internal) {
    return;
  }

  internal = loadOrCreate();
}

/**
 * Живой снимок (мутабельный). Использовать только внутри mock-слоя данных;
 * после прямых правок вызвать persistMockDatabase().
 */
export function unsafeMutableMockDb(): MockDbSnapshot {
  ensureMockDatabaseLoaded();
  return internal!;
}

/** Глубокая копия для отладки / экспорта. */
export function getMockDbSnapshot(): MockDbSnapshot {
  return cloneDeep(unsafeMutableMockDb());
}

export function persistMockDatabase(): void {
  ensureMockDatabaseLoaded();
  persist();
  emit();
}

export function patchMockDatabase(recipe: (db: MockDbSnapshot) => void): void {
  const db = unsafeMutableMockDb();
  recipe(db);
  persistMockDatabase();
}

export function resetMockDatabase(): void {
  internal = buildInitialSnapshot();
  persist();
  emit();
}

export function subscribeMockDatabase(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function clearMockDatabaseStorageAndReload(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MOCK_DB_STORAGE_KEY);
  }

  internal = null;
  ensureMockDatabaseLoaded();
  emit();
}

export { MOCK_DB_VERSION };
