import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { routes } from "@/app/router/routes";
import { configureHttpClient } from "@/shared/api/http";
import { authStore } from "@/features/auth/model/authStore";

const router = createBrowserRouter(routes);

function bootstrap() {
  configureHttpClient({
    getAuthToken: () => authStore.getToken(),
  });

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}

bootstrap();
