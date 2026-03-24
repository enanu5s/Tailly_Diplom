// src/features/posts/api/postsApi.mock.ts

import { readAdminManagedPosts } from '@/features/admin-posts-banners-management/data/adminPostsBannersStorage';
import type { AdminManagedPost } from '@/features/admin-posts-banners-management/model/types';

import type { Post, PostsListParams, PostsListResponse, PostsSort } from '../model/types';

function buildPublicPostImageUrls(adminPost: AdminManagedPost): string[] {
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

  push(adminPost.coverImageUrl);

  for (const url of adminPost.imageUrls ?? []) {
    push(url);
  }

  return out;
}

function mapAdminPostToPost(adminPost: AdminManagedPost): Post {
  const imageUrls = buildPublicPostImageUrls(adminPost);
  const primary = imageUrls[0];

  return {
    id: adminPost.id,
    title: adminPost.title,
    content: adminPost.content,
    imageUrl: primary,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    publishedAt: adminPost.publishedAt || adminPost.createdAt,
    tags: adminPost.tags,
  };
}

function normalizeTag(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function sortPosts(posts: Post[], sort: PostsSort = 'newest'): Post[] {
  const copy = [...posts];

  switch (sort) {
    case 'oldest':
      return copy.sort(
        (left, right) =>
          new Date(left.publishedAt).getTime() -
          new Date(right.publishedAt).getTime(),
      );

    case 'title_asc':
      return copy.sort((left, right) =>
        left.title.localeCompare(right.title, 'ru'),
      );

    case 'title_desc':
      return copy.sort((left, right) =>
        right.title.localeCompare(left.title, 'ru'),
      );

    case 'newest':
    default:
      return copy.sort(
        (left, right) =>
          new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime(),
      );
  }
}

function filterSearch(posts: Post[], search?: string): Post[] {
  const query = (search ?? '').trim().toLowerCase();

  if (!query) {
    return posts;
  }

  return posts.filter((post) =>
    `${post.title} ${post.content} ${(post.tags ?? []).join(' ')}`
      .toLowerCase()
      .includes(query),
  );
}

function filterByTag(posts: Post[], tag?: string): Post[] {
  const normalizedTag = normalizeTag(tag);

  if (!normalizedTag) {
    return posts;
  }

  return posts.filter((post) =>
    (post.tags ?? []).some((item) => normalizeTag(item) === normalizedTag),
  );
}

function getAvailableTags(posts: Post[]): string[] {
  const uniqueTags = new Map<string, string>();

  posts.forEach((post) => {
    (post.tags ?? []).forEach((tag) => {
      const trimmedTag = tag.trim();

      if (!trimmedTag) {
        return;
      }

      const normalized = trimmedTag.toLowerCase();

      if (!uniqueTags.has(normalized)) {
        uniqueTags.set(normalized, trimmedTag);
      }
    });
  });

  return Array.from(uniqueTags.values()).sort((left, right) =>
    left.localeCompare(right, 'ru'),
  );
}

export async function mockGetLatestPosts(limit: number): Promise<Post[]> {
  const posts = (await readAdminManagedPosts())
    .filter((post) => post.status === 'published')
    .map(mapAdminPostToPost);

  return sortPosts(posts, 'newest').slice(0, limit);
}

export async function mockGetPostsList(
  params: PostsListParams,
): Promise<PostsListResponse> {
  const publishedPosts = (await readAdminManagedPosts())
    .filter((post) => post.status === 'published')
    .map(mapAdminPostToPost);

  const filteredBySearch = filterSearch(publishedPosts, params.search);
  const filtered = filterByTag(filteredBySearch, params.tag);
  const sorted = sortPosts(filtered, params.sort ?? 'newest');

  const total = sorted.length;
  const start = (params.page - 1) * params.pageSize;
  const items = sorted.slice(start, start + params.pageSize);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    availableTags: getAvailableTags(publishedPosts),
  };
}

export async function mockGetPostById(id: string): Promise<Post> {
  const post = (await readAdminManagedPosts()).find(
    (item) => item.id === id && item.status === 'published',
  );

  if (!post) {
    throw new Error('Пост не найден');
  }

  return mapAdminPostToPost(post);
}