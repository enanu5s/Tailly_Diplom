// src/features/posts/data/mockPosts.ts
import { SEED_CMS_POSTS } from '@/shared/mock-db/seed/cms.seed';

import type { Post } from '../model/types';

function buildImageUrls(coverImageUrl: string | undefined, imageUrls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (raw?: string) => {
    const url = (raw ?? '').trim();
    if (!url || seen.has(url)) {
      return;
    }

    seen.add(url);
    out.push(url);
  };

  push(coverImageUrl);

  for (const url of imageUrls) {
    push(url);
  }

  return out;
}

export const MOCK_POSTS: Post[] = SEED_CMS_POSTS.filter((p) => p.status === 'published').map(
  (p) => {
    const imageUrls = buildImageUrls(p.coverImageUrl, p.imageUrls ?? []);
    const primary = imageUrls[0];

    return {
      id: p.id,
      title: p.title,
      content: p.content,
      publishedAt: p.publishedAt ?? p.updatedAt,
      imageUrl: primary,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      tags: p.tags,
    };
  },
);
