// src/app/router/routes.tsx
import type { RouteObject } from 'react-router-dom'
import { HomePage } from '@/pages/home'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },

]