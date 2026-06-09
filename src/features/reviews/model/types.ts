//src/features/reviews/model/types.ts

export type ReviewCreatePayload = {
  orderId: string;
  rating: number; // 1..5, только целые
  text: string;
  photoUrls: string[]; // пока локальные objectURL или ссылки
};

export type ReviewContext = {
  orderId: string;
  petId: string;
  petName: string;

  ownerFullName: string;

  sitterId: string;
  sitterName: string;

  serviceTitle: string;
};

export type Review = {
  id: string;
  orderId: string;
  rating: number;
  text: string;
  photoUrls: string[];
  createdAtIso: string;

  petName: string;
  ownerFullName: string;

  sitterId: string;
  sitterName: string;

  serviceTitle: string;
};
