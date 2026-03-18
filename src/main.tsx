// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { routes } from "@/app/router/routes";
import { authStore } from "@/features/auth/model/authStore";
import { configureHttpClient } from "@/shared/api/http";

const router = createBrowserRouter(routes);

function getUnauthorizedRedirectPath(pathname: string): string {
  if (pathname.startsWith("/admin")) {
    return "/admin/login";
  }

  return "/login";
}

function bootstrap() {
  configureHttpClient({
    getAuthToken: () => authStore.getToken(),
    onUnauthorized: () => {
      const redirectPath = getUnauthorizedRedirectPath(
        window.location.pathname,
      );

      authStore.logout();

      if (window.location.pathname !== redirectPath) {
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