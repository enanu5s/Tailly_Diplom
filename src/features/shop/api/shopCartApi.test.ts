import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/config/env', () => ({
  get2GisApiKey: () => '',
  getOptionalApiBaseUrl: () => '',
  getSupportEmailFromEnv: () => undefined,
  isMockApiMode: false,
  resolveApiBaseUrl: () => 'http://api.test',
}));

import { shopCartApi } from './shopCartApi';

describe('shopCartApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('syncs cart snapshot through shop cart endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    vi.stubGlobal('fetch', fetchMock);

    await shopCartApi.syncSnapshot([
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://api.test/shop/cart',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://api.test/shop/cart',
      expect.objectContaining({
        body: JSON.stringify({ productId: 'product-1', quantity: 2 }),
        method: 'POST',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://api.test/shop/cart',
      expect.objectContaining({
        body: JSON.stringify({ productId: 'product-2', quantity: 1 }),
        method: 'POST',
      }),
    );
  });

  it('merges guest cart through the shop cart endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    vi.stubGlobal('fetch', fetchMock);

    await shopCartApi.mergeAfterLogin({ merge: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/shop/cart/merge',
      expect.objectContaining({
        body: JSON.stringify({ merge: true }),
        method: 'POST',
      }),
    );
  });
});
