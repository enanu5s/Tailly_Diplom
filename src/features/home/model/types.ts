// src/features/home/model/types.ts

import type { ServiceConfig } from '@/shared/config/services';

export type HomeBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string; // /public/images/... или полный URL
  createdAtIso: string;
  postId: string; // на какой пост ведём
};

export type HomeReview = {
  id: string;
  createdAtIso: string;
  rating: 5; // на главной только 5
  text: string;
  petName: string;
  ownerName: string;
  sitterId: string;
  sitterName: string;
  serviceTitle: string;
  photoUrls: string[];
};

export type HomeService = ServiceConfig;