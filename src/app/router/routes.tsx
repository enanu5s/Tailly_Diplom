// src/app/router/routes.tsx

import { Layout } from '@/app/Layout';
import { AppErrorPage } from '@/pages/app-error';

import { adminRoutes } from './adminRoutes';
import { clientRoutes } from './clientRoutes';
import { publicRoutes } from './publicRoutes';
import { shopRoutes } from './shopRoutes';

import type { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <AppErrorPage />,
    children: [...publicRoutes, ...clientRoutes, ...shopRoutes, ...adminRoutes],
  },
];
