// src/app/router/routes.tsx
import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/app/Layout'           // ← новый импорт
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register';

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
    ],
  },
]