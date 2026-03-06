// src/features/home/model/homeStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import type { HomeBanner, HomeReview, HomeService } from './types';
import { homeService } from '../service/homeService';

export class HomeStore {
  banners: HomeBanner[] = [];
  services: HomeService[] = [];
  reviews: HomeReview[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const [banners, services, reviews] = await Promise.all([
        homeService.getLatestBanners(),
        homeService.getServices(),
        homeService.getTopReviews(),
      ]);

      runInAction(() => {
        this.banners = banners.slice(0, 5);
        this.services = services;
        this.reviews = reviews.slice(0, 5);
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить главную страницу';
        this.loading = false;
      });
    }
  }
}

export const homeStore = new HomeStore();