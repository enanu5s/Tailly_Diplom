// src/features/home/model/types.ts

import type { ServiceConfig } from '@/shared/config/services';

export type HomeBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  createdAtIso: string;
  postId?: string;
  linkUrl?: string;
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
