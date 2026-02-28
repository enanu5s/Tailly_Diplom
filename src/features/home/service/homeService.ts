//src/features/home/service/homeService.ts
import { homeApi } from '../api/homeApi';

export const homeService = {
  getLatestBanners: () => homeApi.getLatestBanners(),
  getServices: () => homeApi.getServices(),
  getTopReviews: () => homeApi.getTopReviews(),
};