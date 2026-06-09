// src/features/posts/lib/postGallery.ts
import type { Post } from '../model/types';

export function getPostGalleryUrls(post: Post): string[] {
  if (Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
    return post.imageUrls.filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0,
    );
  }

  const single = post.imageUrl?.trim();
  return single ? [single] : [];
}
