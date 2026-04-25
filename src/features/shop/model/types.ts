// src/features/shop/model/types.ts

export type ProductCategory = {
  id: string;
  slug: string;
  title: string;
};

export type ProductSort =
  | 'popular'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'newest';

export type DeliveryMethod = 'courier' | 'pickup-point';

export type PaymentMethod = 'card' | 'sbp' | 'cash';

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'processing'
  | 'delivering'
  | 'ready-for-pickup'
  | 'completed'
  | 'cancelled';

export type ProductReviewReply = {
  authorName: string;
  text: string;
  createdAt: string;
};

export type ProductReview = {
  id: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;
  siteReply?: ProductReviewReply | null;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type ProductDescriptionContent = {
  summary?: string;
  suitableFor?: string[];
  benefits?: string[];
  features?: string[];
  usage?: string;
  composition?: string;
};

export type ProductCharacteristics = {
  brand?: string;
  countryOfOrigin?: string;
  forWhom?: string;
  purpose?: string;
  petSize?: string;
  material?: string;
};

export type ProductDeliveryRange = {
  from: string;
  to: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  shortDescription: string;
  description: string;
  descriptionContent?: ProductDescriptionContent;
  characteristics?: ProductCharacteristics;
  deliveryRange?: ProductDeliveryRange;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviewsCount: number;
  isAvailable: boolean;
  stockQuantity: number;
  images: ProductImage[];
  reviews: ProductReview[];
  createdAt: string;
  updatedAt: string;
};

export type CatalogFilterState = {
  search: string;
  categoryIds: string[];
  minPrice: number | null;
  maxPrice: number | null;
  onlyAvailable: boolean;
  sort: ProductSort;
  page: number;
  limit: number;
};

export type CatalogProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
};

export type CatalogMetaResponse = {
  categories: ProductCategory[];
  minPrice: number;
  maxPrice: number;
  availableSorts: ProductSort[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartDetailedItem = {
  product: Product;
  quantity: number;
  lineTotal: number;
};

export type CartSummary = {
  items: CartDetailedItem[];
  totalItems: number;
  totalPrice: number;
};

export type FavoriteItem = {
  productId: string;
  addedAt: string;
};

export type CheckoutRecipient = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type CheckoutAddress = {
  city: string;
  street: string;
  house: string;
  apartment: string;
  comment: string;
};

export type PickupPoint = {
  id: string;
  provider: 'cdek';
  title: string;
  address: string;
  estimatedDate: string;
};

export type CheckoutForm = {
  recipient: CheckoutRecipient;
  deliveryMethod: DeliveryMethod;
  address: CheckoutAddress;
  pickupPointId: string | null;
  paymentMethod: PaymentMethod;
};

export type Order = {
  id: string;
  status: OrderStatus;
  items: CartDetailedItem[];
  totalPrice: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  estimatedDeliveryDate: string | null;
  createdAt: string;
  canBeCancelled: boolean;
  /** Владелец заказа в mock (совпадает с AuthUser.id клиента/специалиста) */
  ownerUserId?: string;
  /** Для писем о статусе заказа (mock / бэкенд) */
  recipientEmail?: string;
  recipientName?: string;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilterState = {
  search: '',
  categoryIds: [],
  minPrice: null,
  maxPrice: null,
  onlyAvailable: false,
  sort: 'popular',
  page: 1,
  limit: 12,
};
