// src/features/orders/model/types.ts

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'canceled';

export type ServicesFilter =
  | 'all'
  | 'upcoming'
  | 'pending_confirmation'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'canceled';

export type ServicePriceUnit =
  | 'hour'
  | 'day'
  | 'service'
  | 'walk'
  | 'visit';

export type ServiceBookingMode =
  | 'fixed_slot'
  | 'time_range'
  | 'multi_day_stay'
  | 'open_request';

export type ServiceOrderLifecycleEvent = {
  status: OrderStatus;
  changedAt: string;
  comment?: string;
};

export type ServiceOrderFixedSlotSchedule = {
  mode: 'fixed_slot';
  startAt: string;
  endAt: string;
};

export type ServiceOrderTimeRangeSchedule = {
  mode: 'time_range';
  startAt: string;
  endAt: string;
};

export type ServiceOrderMultiDaySchedule = {
  mode: 'multi_day_stay';
  checkInAt: string;
  checkOutAt: string;
  stayDays: number;
};

export type ServiceOrderOpenRequestSchedule = {
  mode: 'open_request';
  requestedDate?: string;
  requestedStartTime?: string;
  requestedEndTime?: string;
};

export type ServiceOrderSchedule =
  | ServiceOrderFixedSlotSchedule
  | ServiceOrderTimeRangeSchedule
  | ServiceOrderMultiDaySchedule
  | ServiceOrderOpenRequestSchedule;

export type ServiceOrderServiceSnapshot = {
  id: string;
  title: string;
  locationLabel: string;
  price: number;
  priceUnit: ServicePriceUnit;
  bookingMode: ServiceBookingMode;
};

export type ServiceOrderReviewReply = {
  comment: string;
  createdAt: string;
};

export type ServiceOrderReview = {
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  photos: string[];
  createdAt: string;
  specialistReply?: ServiceOrderReviewReply | null;
};

export type LeaveServiceReviewPayload = {
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  photos: string[];
};

export type ServiceOrder = {
  id: string;
  createdAt: string;
  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;

  dateFrom: string;
  dateTo?: string;

  schedule: ServiceOrderSchedule;

  petId: string;
  petName: string;

  sitterId: string;
  sitterName: string;
  specialistSlug: string;

  status: OrderStatus;

  serviceId: string;
  serviceTitle: string;
  servicePriceUnit: ServicePriceUnit;

  serviceSnapshot: ServiceOrderServiceSnapshot;

  locationLabel: string;
  comment?: string;

  price: number;
  currency: 'RUB';

  rating?: number;
  hasReview: boolean;
  review?: ServiceOrderReview | null;

  lifecycle: ServiceOrderLifecycleEvent[];
};

export type CreateServiceOrderPayload = {
  dateFrom: string;
  dateTo?: string;

  schedule: ServiceOrderSchedule;

  petId: string;
  petName: string;

  sitterId: string;
  sitterName: string;
  specialistSlug: string;

  serviceId: string;
  serviceTitle: string;
  servicePriceUnit: ServicePriceUnit;
  bookingMode: ServiceBookingMode;

  locationLabel: string;
  comment?: string;

  price: number;
  currency: 'RUB';
};

export type RepeatServiceOrderDraftPayload = {
  petId: string;
  petName: string;
  sitterId: string;
  sitterName: string;
  specialistSlug: string;
  serviceId: string;
  serviceTitle: string;
  servicePriceUnit: ServicePriceUnit;
  bookingMode: ServiceBookingMode;
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
  draftPayload?: RepeatServiceOrderDraftPayload;
};

export type ReviewResult = {
  ok: true;
  review?: ServiceOrderReview;
};

export type CompleteOrderResult = {
  ok: true;
};

export type ConfirmOrderResult = {
  ok: true;
};

export type StartOrderResult = {
  ok: true;
};

export type CancelOrderResult = {
  ok: true;
};