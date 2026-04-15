// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { routes } from '@/app/router/routes';
import { authService } from '@/features/auth/service/authService';
import { authStore } from '@/features/auth/model/authStore';
import { migrateAdminPostsFromIndexedDbOnce } from '@/features/admin-posts-banners-management/data/adminPostsBannersStorage';
import { seedDemoMessagesIfEmpty } from '@/features/messages/data/messagesStorage';
import { configureHttpClient } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';
import { runEmailNotificationScheduler } from '@/shared/lib/emailNotifications';
import { refreshAllMockSpecialistListingStatsFromOrders } from '@/features/specialists-search/data/mockSpecialists';
import { ensureMockDatabaseLoaded } from '@/shared/mock-db/store';

const router = createBrowserRouter(routes);

export function getUnauthorizedRedirectPath(pathname: string): string {
  const normalizedPath = pathname.trim() || '/';
  const encodedFrom = encodeURIComponent(normalizedPath);

  return `/login?from=${encodedFrom}`;
}

function bootstrap() {
  if (isMockApiMode) {
    ensureMockDatabaseLoaded();
    void migrateAdminPostsFromIndexedDbOnce();
    refreshAllMockSpecialistListingStatsFromOrders();
    seedDemoMessagesIfEmpty();
  }

  configureHttpClient({
    getAuthToken: () => authStore.getToken(),
    onUnauthorized: () => {
      console.log('[main] unauthorized response', {
        currentPath: window.location.pathname,
        currentSearch: window.location.search,
        token: authStore.getToken(),
      });
    },
  });

  /* configureHttpClient({
    getAuthToken: () => authStore.getToken(),
    onUnauthorized: () => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const redirectPath = getUnauthorizedRedirectPath(currentPath);

      authService.logout();

      if (currentPath === '/login') {
        return;
      }

      if (`${currentPath}${currentSearch}` !== redirectPath) {
        window.location.replace(redirectPath);
      }
    },
  }); */

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );

  runEmailNotificationScheduler();
  window.setInterval(runEmailNotificationScheduler, 5 * 60 * 1000);
}

bootstrap();
