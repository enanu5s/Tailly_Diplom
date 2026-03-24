//src/features/reviews/model/reviewCreateStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { reviewsService } from '../service/reviewsService';

import type { Review, ReviewContext } from './types';

type LocalPhoto = { url: string; file: File };

export class ReviewCreateStore {
  context: ReviewContext | null = null;

  loading = false;
  error: string | null = null;

  rating = 0; // 1..5
  text = '';

  photos: LocalPhoto[] = [];

  submitLoading = false;
  submitError: string | null = null;
  submitSuccess = false;

  createdReview: Review | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load(orderId: string) {
    this.loading = true;
    this.error = null;
    try {
      const ctx = await reviewsService.getContext(orderId);
      runInAction(() => {
        this.context = ctx;
        this.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error =
          e instanceof Error ? e.message : 'Не удалось загрузить данные заказа';
        this.loading = false;
      });
    }
  }

  setRating(v: number) {
    this.rating = Math.max(0, Math.min(5, Math.floor(v)));
  }

  setText(v: string) {
    this.text = v;
  }

  addPhotos(files: File[]) {
    for (const f of files) {
      const url = URL.createObjectURL(f);
      this.photos.push({ url, file: f });
    }
  }

  removePhoto(url: string) {
    const idx = this.photos.findIndex((p) => p.url === url);
    if (idx < 0) return;
    URL.revokeObjectURL(this.photos[idx].url);
    this.photos.splice(idx, 1);
  }

  reset() {
    for (const p of this.photos) URL.revokeObjectURL(p.url);
    this.photos = [];
    this.rating = 0;
    this.text = '';
    this.submitLoading = false;
    this.submitError = null;
    this.submitSuccess = false;
    this.createdReview = null;
  }

  async submit() {
    if (!this.context) return;

    const text = this.text.trim();
    if (!this.rating) {
      this.submitError = 'Поставьте оценку';
      return;
    }
    if (!text) {
      this.submitError = 'Введите текст отзыва';
      return;
    }

    this.submitLoading = true;
    this.submitError = null;
    this.submitSuccess = false;

    try {
      const review = await reviewsService.createReview({
        orderId: this.context.orderId,
        rating: this.rating,
        text,
        photoUrls: this.photos.map((p) => p.url),
      });

      runInAction(() => {
        this.createdReview = review;
        this.submitLoading = false;
        this.submitSuccess = true;
      });
    } catch (e) {
      runInAction(() => {
        this.submitError = e instanceof Error ? e.message : 'Не удалось отправить отзыв';
        this.submitLoading = false;
      });
    }
  }
}

export const reviewCreateStore = new ReviewCreateStore();
