// src/shared/mock-db/applyCmsDataRevision.ts

import { cloneDeep } from './cloneDeep';
import { SEED_CMS_BANNERS, SEED_CMS_DATA_REVISION, SEED_CMS_POSTS } from './seed/cms.seed';

import type { MockDbSnapshot } from './types';

const STALE_BANNER_IMAGE_PREFIXES = [
  '/images/banner-home-hero',
  '/images/banner-posts',
  '/images/banner-specialists',
] as const;

function hasStaleBannerImages(db: MockDbSnapshot): boolean {
  return db.cms.banners.some((banner) => {
    const imageUrl = banner.imageUrl?.trim() ?? '';
    return STALE_BANNER_IMAGE_PREFIXES.some((prefix) => imageUrl.startsWith(prefix));
  });
}

export function applyCmsDataRevisionIfStale(db: MockDbSnapshot): MockDbSnapshot {
  const revisionIsCurrent = db.meta.cmsDataRevision === SEED_CMS_DATA_REVISION;

  if (revisionIsCurrent && !hasStaleBannerImages(db)) {
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
