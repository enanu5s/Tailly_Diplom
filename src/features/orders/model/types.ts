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

export type ServicePriceUnit = 'hour' | 'day' | 'service' | 'walk' | 'visit';

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

  clientId: string;
  clientName: string;
  clientSlug: string;

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

  clientId: string;
  clientName: string;
  clientSlug: string;

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

export type CreateServiceOrderRequestPayload = {
  dateFrom: string;
  dateTo?: string;

  schedule: ServiceOrderSchedule;

  petId: string;
  specialistId: string;
  specialistSlug: string;

  serviceId: string;
  locationLabel: string;
  comment?: string;
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

export type ProductOrderItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
};

export type ProductOrderRecipient = {
  fullName: string;
  phone: string;
};

export type ProductOrderDeliveryAddress = {
  city: string;
  street: string;
  house: string;
  apartment?: string;
  comment?: string;
  postalCode?: string;
};

export type ProductOrderDelivery = {
  method: 'courier' | 'pickup';
  address?: ProductOrderDeliveryAddress;
  pickupPointLabel?: string;
  expectedAt?: string;
  trackingNumber?: string;
};

export type ProductOrderPayment = {
  method: 'card' | 'sbp' | 'cash_on_delivery' | 'card_on_delivery';
  status: 'pending' | 'paid' | 'refunded';
};

export type ProductOrderLifecycleEvent = {
  status: ProductOrderStatus;
  changedAt: string;
  comment?: string;
};

export type ProductOrder = {
  id: string;
  number: string;
  status: ProductOrderStatus;
  createdAt: string;
  price: number;
  currency: 'RUB';
  itemsCount: number;
  productThumbs?: string[];
  /** В mock — для фильтрации списка по текущему пользователю */
  ownerUserId?: string;
  /** Актуальная возможность отмены (если приходит из API) */
  canBeCancelled?: boolean;

  items: ProductOrderItem[];

  recipient?: ProductOrderRecipient;
  delivery?: ProductOrderDelivery;
  payment?: ProductOrderPayment;
  cancelReason?: string;
  canceledAt?: string;
  lifecycle?: ProductOrderLifecycleEvent[];
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

export function isProductOrderCompleted(order: ProductOrder): boolean {
  return order.status === 'delivered';
}

export function isProductOrderCanceled(order: ProductOrder): boolean {
  return order.status === 'canceled';
}

export function isProductOrderActive(order: ProductOrder): boolean {
  return (
    order.status === 'created' || order.status === 'paid' || order.status === 'shipped'
  );
}

export function canCancelProductOrder(
  order: Pick<ProductOrder, 'status' | 'canBeCancelled'>,
): boolean {
  if (order.canBeCancelled === false) {
    return false;
  }

  return order.status === 'created' || order.status === 'paid';
}

export function shouldOpenProductOrderDetails(order: ProductOrder): boolean {
  return isProductOrderActive(order);
}
