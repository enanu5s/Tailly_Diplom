//src/features/orders/model/productOrderRepeatCheckout.ts

export type ProductOrderRepeatCheckoutItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
};

export type ProductOrderRepeatCheckoutDraft = {
  source: 'repeat_product_order';
  orderId: string;
  createdAt: string;
  items: ProductOrderRepeatCheckoutItem[];
};
