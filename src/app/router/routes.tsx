// src/app/router/routes.tsx
import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/app/Layout'           // ← новый импорт
import { HomePage } from '@/pages/home'

export const routes: RouteObject[] = [
  {
    element: <Layout />,                        // ← общая обвязка
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      // сюда потом добавите остальные страницы
      // {
      //   path: '/services',
      //   element: <ServicesPage />,
      // },
    ],
  },
]