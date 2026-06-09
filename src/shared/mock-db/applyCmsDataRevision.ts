// src/shared/mock-db/applyCmsDataRevision.ts

import { cloneDeep } from './cloneDeep';
import { SEED_CMS_BANNERS, SEED_CMS_DATA_REVISION, SEED_CMS_POSTS } from './seed/cms.seed';

import type { MockDbSnapshot } from './types';

export function applyCmsDataRevisionIfStale(db: MockDbSnapshot): MockDbSnapshot {
  if (db.meta.cmsDataRevision === SEED_CMS_DATA_REVISION) {
    return db;
  }

  const next = cloneDeep(db);
  next.cms = {
    posts: cloneDeep(SEED_CMS_POSTS),
    banners: cloneDeep(SEED_CMS_BANNERS),
  };
  next.meta = {
    ...next.meta,
    cmsDataRevision: SEED_CMS_DATA_REVISION,
  };

  return next;
}
