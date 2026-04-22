import { request } from '@/shared/api/http';

type FavoriteListItem = {
  productId: string;
};

type FavoriteListResponse = {
  items?: FavoriteListItem[];
  productIds?: string[];
};

function getFavoritesBasePath(): string {
  return '/favorite';
}

async function getFavorites(): Promise<string[]> {
  const response = await request<FavoriteListResponse>(getFavoritesBasePath());

  if (Array.isArray(response?.productIds)) {
    return response.productIds.filter(
      (id): id is string => typeof id === 'string' && id.trim().length > 0,
    );
  }

  const items = Array.isArray(response?.items) ? response.items : [];

  return items
    .map((item) => item.productId)
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
}

async function clearFavorites(): Promise<void> {
  await request<void>(`${getFavoritesBasePath()}/clear`, {
    method: 'DELETE',
  });
}

async function addFavorite(productId: string): Promise<void> {
  await request<void>(`${getFavoritesBasePath()}/${encodeURIComponent(productId)}`, {
    method: 'POST',
  });
}

export const shopFavoritesApi = {
  getFavorites,

  async syncSnapshot(productIds: string[]): Promise<void> {
    await clearFavorites();

    for (const productId of productIds) {
      await addFavorite(productId);
    }
  },
};
