import { request } from '@/shared/api/http';

async function clearFavorites(): Promise<void> {
  await request<void>('/favorite/clear', {
    method: 'DELETE',
  });
}

async function addFavorite(productId: string): Promise<void> {
  await request<void>(`/favorite/${encodeURIComponent(productId)}`, {
    method: 'POST',
  });
}

export const shopFavoritesApi = {
  async syncSnapshot(productIds: string[]): Promise<void> {
    await clearFavorites();

    for (const productId of productIds) {
      await addFavorite(productId);
    }
  },
};
