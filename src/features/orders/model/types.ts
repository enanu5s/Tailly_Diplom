// src/features/orders/model/types.ts

export type OrderStatus = 'upcoming' | 'active' | 'completed' | 'canceled';

export type ServicesFilter =
  | 'all'
  | 'upcoming'
  | 'active'
  | 'completed'
  | 'canceled';

export type ServicePriceUnit =
  | 'hour'
  | 'day'
  | 'service'
  | 'walk'
  | 'visit';

export type ServiceOrder = {
  id: string;
  createdAt: string;
  completedAt?: string;
  dateFrom: string;
  dateTo?: string;
  petId: string;
  petName: string;
  sitterId: string;
  sitterName: string;
  specialistSlug: string;
  status: OrderStatus;
  serviceId: string;
  serviceTitle: string;
  servicePriceUnit: ServicePriceUnit;
  locationLabel: string;
  comment?: string;
  price: number;
  currency: 'RUB';
  rating?: number;
  hasReview: boolean;
};

export type CreateServiceOrderPayload = {
  dateFrom: string;
  dateTo?: string;
  petId: string;
  petName: string;
  sitterId: string;
  sitterName: string;
  specialistSlug: string;
  serviceId: string;
  serviceTitle: string;
  servicePriceUnit: ServicePriceUnit;
  locationLabel: string;
  comment?: string;
  price: number;
  currency: 'RUB';
};

export type ProductOrderStatus =
  | 'created'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'canceled';

export type ProductOrder = {
  id: string;
  number: string;
  status: ProductOrderStatus;
  createdAt: string;
  price: number;
  currency: 'RUB';
  itemsCount: number;
  productThumbs: string[];
};

export type RepeatResult = {
  ok: true;
};

export type ReviewResult = {
  ok: true;
};

export type CompleteOrderResult = {
  ok: true;
};