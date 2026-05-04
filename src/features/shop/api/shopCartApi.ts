import { request } from '@/shared/api/http';

type SyncCartItem = {
  productId: string;
  quantity: number;
};

type MergeCartPayload = {
  merge: boolean;
};

function getCartBasePath(): string {
  return '/shop/cart';
}

async function clearCart(): Promise<void> {
  await request<void>(getCartBasePath(), {
    method: 'DELETE',
  });
}

async function addCartItem(item: SyncCartItem): Promise<void> {
  await request<void>(getCartBasePath(), {
    method: 'POST',
    body: {
      productId: item.productId,
      quantity: item.quantity,
    },
  });
}

export const shopCartApi = {
  mergeAfterLogin(payload: MergeCartPayload): Promise<void> {
    return request<void>(`${getCartBasePath()}/merge`, {
      method: 'POST',
      body: payload,
    });
  },

  async syncSnapshot(items: SyncCartItem[]): Promise<void> {
    await clearCart();

    for (const item of items) {
      await addCartItem(item);
    }
  },
};
