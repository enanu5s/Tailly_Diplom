// src/features/posts/model/postsStore.ts

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
  selectedTag: string;
  availableTags: string[];
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
  latest: LatestState = {
    items: [],
    loading: false,
    error: null,
  };

  list: ListState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 9,
    search: '',
    sort: 'newest',
    selectedTag: '',
    availableTags: [],
    loading: false,
    error: null,
  };

  details: DetailsState = {
    post: null,
    loading: false,
    error: null,
  };

  private searchDebounceTimer: ReturnType<typeof window.setTimeout> | null = null;

  private listRequestId = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.list.total / this.list.pageSize));
  }

  get hasActiveFilters(): boolean {
    return Boolean(this.list.search.trim() || this.list.selectedTag);
  }

  setListPage(page: number): void {
    this.list.page = Math.min(Math.max(1, page), this.totalPages);
  }

  setSearch(value: string): void {
    this.list.search = value;
    this.list.page = 1;
    this.scheduleSearch();
  }

  setSort(value: PostsSort): void {
    this.list.sort = value;
    this.list.page = 1;
    void this.loadList();
  }

  setSelectedTag(value: string): void {
    this.list.selectedTag = value;
    this.list.page = 1;
    void this.loadList();
  }

  clearFilters(): void {
    this.list.search = '';
    this.list.selectedTag = '';
    this.list.sort = 'newest';
    this.list.page = 1;
    void this.loadList();
  }

  private clearSearchDebounce(): void {
    if (this.searchDebounceTimer !== null) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  private scheduleSearch(): void {
    this.clearSearchDebounce();

    this.searchDebounceTimer = window.setTimeout(() => {
      void this.loadList();
    }, 350);
  }

  async loadLatest(limit = 5): Promise<void> {
    this.latest.loading = true;
    this.latest.error = null;

    try {
      const items = await postsApi.getLatestPosts(limit);

      runInAction(() => {
        this.latest.items = items;
        this.latest.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.latest.error =
          error instanceof Error ? error.message : 'Не удалось загрузить посты';
        this.latest.loading = false;
      });
    }
  }

  async loadList(): Promise<void> {
    this.clearSearchDebounce();

    const requestId = ++this.listRequestId;

    this.list.loading = true;
    this.list.error = null;

    try {
      const response: PostsListResponse = await postsApi.getPostsList({
        page: this.list.page,
        pageSize: this.list.pageSize,
        search: this.list.search.trim() || undefined,
        sort: this.list.sort,
        tag: this.list.selectedTag || undefined,
      });

      runInAction(() => {
        if (requestId !== this.listRequestId) {
          return;
        }

        this.list.items = response.items;
        this.list.total = response.total;
        this.list.page = response.page;
        this.list.pageSize = response.pageSize;
        this.list.availableTags = response.availableTags ?? [];
        this.list.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        if (requestId !== this.listRequestId) {
          return;
        }

        this.list.error =
          error instanceof Error ? error.message : 'Не удалось загрузить список постов';
        this.list.loading = false;
      });
    }
  }

  async loadPostById(id: string): Promise<void> {
    this.details.loading = true;
    this.details.error = null;
    this.details.post = null;

    try {
      const post = await postsApi.getPostById(id);

      runInAction(() => {
        this.details.post = post;
        this.details.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.details.error =
          error instanceof Error ? error.message : 'Не удалось загрузить пост';
        this.details.loading = false;
      });
    }
  }

  resetDetails(): void {
    this.details.post = null;
    this.details.loading = false;
    this.details.error = null;
  }
}

export const postsStore = new PostsStore();
