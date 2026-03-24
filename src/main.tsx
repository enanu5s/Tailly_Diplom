// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { routes } from "@/app/router/routes";
import { authStore } from "@/features/auth/model/authStore";
import { configureHttpClient } from "@/shared/api/http";

const router = createBrowserRouter(routes);

export function getUnauthorizedRedirectPath(pathname: string): string {
  const normalizedPath = pathname.trim() || '/';
  const encodedFrom = encodeURIComponent(normalizedPath);

  return `/login?from=${encodedFrom}`;
}

function bootstrap() {
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
}

bootstrap();