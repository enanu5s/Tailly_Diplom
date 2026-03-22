// src/features/posts/api/postsApi.mock.ts

import { readAdminManagedPosts } from '@/features/admin-posts-banners-management/data/adminPostsBannersStorage';

import type { Post, PostsListParams, PostsListResponse } from '../model/types';

/* ---------------- MAPPING ---------------- */

function mapAdminPostToPost(adminPost: any): Post {
  return {
    id: adminPost.id,
    title: adminPost.title,
    content: adminPost.content,
    imageUrl:
      adminPost.coverImageUrl ||
      adminPost.imageUrls?.[0] ||
      '',
    publishedAt: adminPost.publishedAt || adminPost.createdAt,
  };
}

/* ---------------- HELPERS ---------------- */

function sortPosts(posts: Post[], sort: PostsListParams['sort']): Post[] {
  const copy = [...posts];

  switch (sort) {
    case 'oldest':
      return copy.sort(
        (a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt),
      );
    case 'title_asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    case 'title_desc':
      return copy.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
    case 'newest':
    default:
      return copy.sort(
        (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
      );
  }
}

function filterSearch(posts: Post[], search?: string): Post[] {
  const query = (search ?? '').trim().toLowerCase();

  if (!query) {
    return posts;
  }

  return posts.filter((post) =>
    `${post.title} ${post.content}`.toLowerCase().includes(query),
  );
}

/* ---------------- API ---------------- */

export async function mockGetLatestPosts(limit: number): Promise<Post[]> {
  const posts = readAdminManagedPosts()
    .filter((post) => post.status === 'published')
    .map(mapAdminPostToPost);

  const sorted = sortPosts(posts, 'newest');

  return sorted.slice(0, limit);
}

export async function mockGetPostsList(
  params: PostsListParams,
): Promise<PostsListResponse> {
  const posts = readAdminManagedPosts()
    .filter((post) => post.status === 'published')
    .map(mapAdminPostToPost);

  const sorted = sortPosts(posts, params.sort ?? 'newest');
  const filtered = filterSearch(sorted, params.search);

  const total = filtered.length;

  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function mockGetPostById(id: string): Promise<Post> {
  const post = readAdminManagedPosts().find((p) => p.id === id);

  if (!post) {
    throw new Error('Пост не найден');
  }

  return mapAdminPostToPost(post);
}