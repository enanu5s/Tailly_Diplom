// src/shared/mock-db/snapshotVersion.ts

import { MOCK_DB_VERSION } from './constants';
import { cloneDeep } from './cloneDeep';
import { SEED_CMS_BANNERS, SEED_CMS_DATA_REVISION, SEED_CMS_POSTS } from './seed/cms.seed';

import type { MockDbMeta, MockDbSnapshot } from './types';

const MOCK_DB_VERSION_LEGACY = 1 as const;

type MockDbSnapshotV1 = Omit<MockDbSnapshot, 'version' | 'cms' | 'messages'> & {
  version: typeof MOCK_DB_VERSION_LEGACY;
};

function upgradeV1ToV2(v1: MockDbSnapshotV1): MockDbSnapshot {
  const base = cloneDeep(v1);

  return {
    ...base,
    version: MOCK_DB_VERSION,
    meta: {
      ...base.meta,
      schemaVersion: MOCK_DB_VERSION,
      cmsDataRevision: SEED_CMS_DATA_REVISION,
    } satisfies MockDbMeta,
    cms: {
      posts: cloneDeep(SEED_CMS_POSTS),
      banners: cloneDeep(SEED_CMS_BANNERS),
    },
    messages: {
      threads: [],
      items: [],
    },
  };
}

export function normalizeSnapshotVersion(raw: unknown): MockDbSnapshot | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const obj = raw as Record<string, unknown>;
  const v = obj.version;

  if (v === MOCK_DB_VERSION) {
    return raw as MockDbSnapshot;
  }

  if (v === MOCK_DB_VERSION_LEGACY) {
    return upgradeV1ToV2(raw as MockDbSnapshotV1);
  }

  return null;
}
