// src/app/router/routes.tsx
import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/app/Layout'           // ← новый импорт
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { RegisterClientStep1Page } from '@/pages/register-client/step1'
import { RegisterClientVerifyPage } from '@/pages/register-client/verify'
import { RegisterClientProfilePage } from '@/pages/register-client/profile';

export const routes: RouteObject[] = [
  {
    element: <Layout />,                        // ← общая обвязка
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      { 
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      },
      { path: '/register/client',
        element: <RegisterClientStep1Page />
      },
      { path: '/register/client/verify',
        element: <RegisterClientVerifyPage />
      },
      { path: '/register/client/profile',
        element: <RegisterClientProfilePage />
      },
    ],
  },
]