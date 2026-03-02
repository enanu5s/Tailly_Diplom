//src/features/home/model/types.ts

export type HomeBanner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string; // /public/images/...
  createdAtIso: string;
  newsId: string; // на какую новость ведём
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