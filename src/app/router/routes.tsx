// src/app/router/routes.tsx

import type { RouteObject } from 'react-router-dom';

import { Layout } from '@/app/Layout';

import { adminRoutes } from './adminRoutes';
import { clientRoutes } from './clientRoutes';
import { publicRoutes } from './publicRoutes';
import { shopRoutes } from './shopRoutes';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      ...publicRoutes,
      ...clientRoutes,
      ...shopRoutes,
      ...adminRoutes,
    ],
  },
];