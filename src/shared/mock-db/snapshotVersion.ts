// src/shared/mock-db/snapshotVersion.ts

import { MOCK_DB_VERSION } from './constants';

import type { MockDbSnapshot } from './types';

/** v3: полный сброс при любой версии, отличной от текущей. */
export function normalizeSnapshotVersion(raw: unknown): MockDbSnapshot | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  if (obj.version === MOCK_DB_VERSION) {
    return raw as MockDbSnapshot;
  }

  return null;
}
