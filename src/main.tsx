// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { routes } from "@/app/router/routes";
import { authStore } from "@/features/auth/model/authStore";
import { configureHttpClient } from "@/shared/api/http";
import { runEmailNotificationScheduler } from "@/shared/lib/emailNotifications";
import { seedDemoMessagesIfEmpty } from "@/features/messages/data/messagesStorage";
import { ensureMockDatabaseLoaded } from "@/shared/mock-db/store";

const router = createBrowserRouter(routes);

export function getUnauthorizedRedirectPath(pathname: string): string {
  const normalizedPath = pathname.trim() || '/';
  const encodedFrom = encodeURIComponent(normalizedPath);

  return `/login?from=${encodedFrom}`;
}

function bootstrap() {
  if ((import.meta.env.VITE_USE_MOCK_API ?? "true") === "true") {
    ensureMockDatabaseLoaded();
    seedDemoMessagesIfEmpty();
  }

  configureHttpClient({
    getAuthToken: () => authStore.getToken(),
    onUnauthorized: () => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const redirectPath = getUnauthorizedRedirectPath(currentPath);
  
      authStore.logout();
  
      if (currentPath === '/login') {
        return;
      }
  
      if (`${currentPath}${currentSearch}` !== redirectPath) {
        window.location.replace(redirectPath);
      }
    },
  });

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );

  runEmailNotificationScheduler();
  window.setInterval(runEmailNotificationScheduler, 5 * 60 * 1000);
}

bootstrap();