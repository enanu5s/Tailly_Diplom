// src/app/router/shopRoutes.tsx

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { withSuspense } from './withSuspense';

const ShopCatalogPage = lazy(() =>
  import('@/pages/shop').then((module) => ({
    default: module.ShopCatalogPage,
  })),
);

const ShopFavoritesPage = lazy(() =>
  import('@/pages/shop').then((module) => ({
    default: module.ShopFavoritesPage,
  })),
);

const ShopCartPage = lazy(() =>
  import('@/pages/shop').then((module) => ({
    default: module.ShopCartPage,
  })),
);

const ShopCheckoutPage = lazy(() =>
  import('@/pages/shop').then((module) => ({
    default: module.ShopCheckoutPage,
  })),
);

const ShopOrderResultPage = lazy(() =>
  import('@/pages/shop').then((module) => ({
    default: module.ShopOrderResultPage,
  })),
);

const ShopProductPage = lazy(() =>
  import('@/pages/shop').then((module) => ({
    default: module.ShopProductPage,
  })),
);

export const shopRoutes: RouteObject[] = [
  {
    path: '/shop',
    element: withSuspense(<ShopCatalogPage />),
  },
  {
    path: '/shop/favorites',
    element: withSuspense(<ShopFavoritesPage />),
  },
  {
    path: '/shop/cart',
    element: withSuspense(<ShopCartPage />),
  },
  {
    path: '/shop/checkout',
    element: withSuspense(<ShopCheckoutPage />),
  },
  {
    path: '/shop/order/:orderId',
    element: withSuspense(<ShopOrderResultPage />),
  },
  {
    path: '/shop/:slug',
    element: withSuspense(<ShopProductPage />),
  },
];