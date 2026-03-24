// src/features/posts/api/postsApi.ts

import { isMockApiMode } from '@/shared/config/env';

import { mockGetLatestPosts, mockGetPostById, mockGetPostsList } from './postsApi.mock';

import type { Post, PostsListParams, PostsListResponse } from '../model/types';

type RequestFunction = <T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined>;
  },
) => Promise<T>;

async function getRequest(): Promise<RequestFunction> {
  const httpModule = await import('@/shared/api/http');

  if ('request' in httpModule && typeof httpModule.request === 'function') {
    return httpModule.request as RequestFunction;
  }

  throw new Error('В "@/shared/api/http" не найден export "request".');
}

async function realGetLatestPosts(limit: number): Promise<Post[]> {
  const request = await getRequest();

  return request<Post[]>('/posts/latest', {
    query: {
      limit,
    },
  });
}

async function realGetPostsList(params: PostsListParams): Promise<PostsListResponse> {
  const request = await getRequest();

  return request<PostsListResponse>('/posts', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      search: params.search?.trim() || undefined,
      tag: params.tag?.trim() || undefined,
    },
  });
}

async function realGetPostById(id: string): Promise<Post> {
  const request = await getRequest();

  return request<Post>(`/posts/${encodeURIComponent(id)}`);
}

export const postsApi = {
  getLatestPosts(limit: number): Promise<Post[]> {
    return isMockApiMode ? mockGetLatestPosts(limit) : realGetLatestPosts(limit);
  },

  getPostsList(params: PostsListParams): Promise<PostsListResponse> {
    return isMockApiMode ? mockGetPostsList(params) : realGetPostsList(params);
  },

  getPostById(id: string): Promise<Post> {
    return isMockApiMode ? mockGetPostById(id) : realGetPostById(id);
  },
};
