import { request } from '@/shared/api/http';

type SyncCartItem = {
  productId: string;
  quantity: number;
};

async function clearCart(): Promise<void> {
  await request<void>('/cart', {
    method: 'DELETE',
  });
}

async function addCartItem(item: SyncCartItem): Promise<void> {
  await request<void>('/cart', {
    method: 'POST',
    body: {
      productId: item.productId,
      quantity: item.quantity,
    },
  });
}

export const shopCartApi = {
  async syncSnapshot(items: SyncCartItem[]): Promise<void> {
    await clearCart();

    for (const item of items) {
      await addCartItem(item);
    }
  },
};
