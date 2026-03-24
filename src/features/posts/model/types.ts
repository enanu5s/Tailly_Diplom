// src/features/posts/model/types.ts

export type Post = {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  imageUrl?: string;
  tags?: string[];
};

export type PostsSort = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export type PostsListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: PostsSort;
  tag?: string;
};

export type PostsListResponse = {
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
  availableTags?: string[];
};