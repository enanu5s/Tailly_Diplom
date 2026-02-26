//src/features/posts/model/postsStore.ts

import { makeAutoObservable, runInAction } from 'mobx';
import { postsApi } from '../api/postsApi';
import type { Post, PostsListResponse, PostsSort } from './types';

type ListState = {
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sort: PostsSort;
  loading: boolean;
  error: string | null;
};

type LatestState = {
  items: Post[];
  loading: boolean;
  error: string | null;
};

type DetailsState = {
  post: Post | null;
  loading: boolean;
  error: string | null;
};

export class PostsStore {
  latest: LatestState = { items: [], loading: false, error: null };
  list: ListState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 9,
    search: '',
    sort: 'newest',
    loading: false,
    error: null,
  };
  details: DetailsState = { post: null, loading: false, error: null };

  constructor() {
    makeAutoObservable(this);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.list.total / this.list.pageSize));
  }

  setListPage(page: number) {
    this.list.page = Math.min(Math.max(1, page), this.totalPages);
  }

  setSearch(value: string) {
    this.list.search = value;
    this.list.page = 1;
  }

  setSort(value: PostsSort) {
    this.list.sort = value;
    this.list.page = 1;
  }

  async loadLatest(limit = 5) {
    this.latest.loading = true;
    this.latest.error = null;

    try {
      const items = await postsApi.getLatestPosts(limit);
      runInAction(() => {
        this.latest.items = items;
        this.latest.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.latest.error = e instanceof Error ? e.message : 'Не удалось загрузить посты';
        this.latest.loading = false;
      });
    }
  }

  async loadList() {
    this.list.loading = true;
    this.list.error = null;

    try {
      const res: PostsListResponse = await postsApi.getPostsList({
        page: this.list.page,
        pageSize: this.list.pageSize,
        search: this.list.search.trim() || undefined,
        sort: this.list.sort,
      });

      runInAction(() => {
        this.list.items = res.items;
        this.list.total = res.total;
        this.list.page = res.page;
        this.list.pageSize = res.pageSize;
        this.list.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.list.error = e instanceof Error ? e.message : 'Не удалось загрузить список постов';
        this.list.loading = false;
      });
    }
  }

  async loadPostById(id: string) {
    this.details.loading = true;
    this.details.error = null;
    this.details.post = null;

    try {
      const post = await postsApi.getPostById(id);
      runInAction(() => {
        this.details.post = post;
        this.details.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.details.error = e instanceof Error ? e.message : 'Не удалось загрузить пост';
        this.details.loading = false;
      });
    }
  }

  resetDetails() {
    this.details.post = null;
    this.details.loading = false;
    this.details.error = null;
  }
}

export const postsStore = new PostsStore();