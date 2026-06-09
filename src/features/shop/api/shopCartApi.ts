import { request } from '@/shared/api/http';

type SyncCartItem = {
  productId: string;
  quantity: number;
};

function getCartBasePath(): string {
  return '/cart';
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

async function syncCartBySnapshotPut(items: SyncCartItem[]): Promise<void> {
  // Support both camelCase and PascalCase DTO naming conventions on backend side.
  await request<void>(getCartBasePath(), {
    method: 'PUT',
    body: {
      items,
      Items: items,
    },
  });
}

export const shopCartApi = {
  async syncSnapshot(items: SyncCartItem[]): Promise<void> {
    try {
      await syncCartBySnapshotPut(items);
      return;
    } catch {
      // Fallback for backends that don't support bulk PUT snapshot.
      await clearCart();

      for (const item of items) {
        await addCartItem(item);
      }
    }
  },
};
