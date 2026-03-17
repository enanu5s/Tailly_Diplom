// src/features/posts/api/postsApi.mock.ts

import { MOCK_POSTS } from '../data/mockPosts';

import type { Post, PostsListParams, PostsListResponse } from '../model/types';

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

export async function mockGetLatestPosts(limit: number): Promise<Post[]> {
  const sorted = sortPosts(MOCK_POSTS, 'newest');
  return sorted.slice(0, limit);
}

export async function mockGetPostsList(
  params: PostsListParams,
): Promise<PostsListResponse> {
  const sorted = sortPosts(MOCK_POSTS, params.sort ?? 'newest');
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
  const found = MOCK_POSTS.find((post) => post.id === id);

  if (!found) {
    throw new Error('Пост не найден');
  }

  return found;
}