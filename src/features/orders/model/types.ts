//src/features/orders/model/types.ts
export type OrderStatus = 'upcoming' | 'active' | 'completed' | 'canceled';

export type ServicesFilter = 'all' | 'upcoming' | 'active' | 'completed' | 'canceled';

export type ServiceOrder = {
  id: string;
  dateFrom: string; // ISO
  dateTo?: string;  // ISO (опционально)
  petId: string;
  petName: string;
  sitterId: string;
  sitterName: string;
  status: OrderStatus;
  serviceTitle: string;

  price: number;
  currency: 'RUB';

  rating?: number;     // 1..5 если есть
  hasReview: boolean;  // оставлен ли отзыв
};

export type ProductOrderStatus = 'created' | 'paid' | 'shipped' | 'delivered' | 'canceled';

export type ProductOrder = {
  id: string;          // внутренний id
  number: string;      // номер заказа (например "№ 10239")
  status: ProductOrderStatus;
  createdAt: string;   // ISO
  price: number;
  currency: 'RUB';
  itemsCount: number;
  productThumbs: string[]; // "/images/..."
};

export type RepeatResult = { ok: true };
export type ReviewResult = { ok: true };