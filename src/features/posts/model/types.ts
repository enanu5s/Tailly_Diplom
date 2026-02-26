export type Post = {
  id: string;
  title: string;
  content: string;
  publishedAt: string; // ISO
  imageUrl?: string;   // "/images/...." или полный URL
  tags?: string[];
};

export type PostsSort = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export type PostsListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: PostsSort;
};

export type PostsListResponse = {
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
};