//src/features/orders/model/productOrderRepeat.ts

export type RepeatableProductOrderItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
};

export type RepeatableProductOrder = {
  id: string;
  status: string;
  items: RepeatableProductOrderItem[];
};

export type PersistedCartItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
};

export function canRepeatProductOrder(order: RepeatableProductOrder): boolean {
  if (!Array.isArray(order.items) || order.items.length === 0) {
    return false;
  }

  return order.status !== 'canceled';
}

export function mapOrderItemsToCartItems(
  order: RepeatableProductOrder,
): PersistedCartItem[] {
  return order.items
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      productId: item.productId,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.imageUrl,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
    }));
}

export function getCartItemMergeKey(item: {
  productId: string;
  variantId?: string;
}): string {
  return `${item.productId}::${item.variantId ?? 'default'}`;
}
