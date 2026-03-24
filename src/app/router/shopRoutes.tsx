// src/app/router/shopRoutes.tsx

import { lazy } from 'react';

import { ShopPurchaseRouteGuard } from '@/app/router/ShopPurchaseRouteGuard';

import { withSuspense } from './withSuspense';

import type { RouteObject } from 'react-router-dom';

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

const ShopPaymentPage = lazy(() =>
  import('@/pages/shop').then((module) => ({
    default: module.ShopPaymentPage,
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
    element: <ShopPurchaseRouteGuard />,
    children: [
      {
        path: '/shop/checkout',
        element: withSuspense(<ShopCheckoutPage />),
      },
      {
        path: '/shop/order/:orderId/payment',
        element: withSuspense(<ShopPaymentPage />),
      },
      {
        path: '/shop/order/:orderId',
        element: withSuspense(<ShopOrderResultPage />),
      },
    ],
  },
  {
    path: '/shop/:slug',
    element: withSuspense(<ShopProductPage />),
  },
];
