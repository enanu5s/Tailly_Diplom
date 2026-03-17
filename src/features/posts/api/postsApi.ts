// src/features/posts/api/postsApi.ts

import { request } from '@/shared/api/http';

import {
  mockGetLatestPosts,
  mockGetPostById,
  mockGetPostsList,
} from './postsApi.mock';

import type { Post, PostsListParams, PostsListResponse } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

/* ---------------- REAL REQUESTS ---------------- */

async function realGetLatestPosts(limit: number): Promise<Post[]> {
  return request<Post[]>('/posts/latest', {
    query: {
      limit,
    },
  });
}

async function realGetPostsList(
  params: PostsListParams,
): Promise<PostsListResponse> {
  return request<PostsListResponse>('/posts', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      search: params.search?.trim() || undefined,
    },
  });
}

async function realGetPostById(id: string): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(id)}`);
}

/* ---------------- PUBLIC API ---------------- */

export const postsApi = {
  getLatestPosts: (limit: number) =>
    USE_MOCK ? mockGetLatestPosts(limit) : realGetLatestPosts(limit),

  getPostsList: (params: PostsListParams) =>
    USE_MOCK ? mockGetPostsList(params) : realGetPostsList(params),

  getPostById: (id: string) =>
    USE_MOCK ? mockGetPostById(id) : realGetPostById(id),
};