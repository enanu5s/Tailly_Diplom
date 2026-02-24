// src/app/router/routes.tsx
import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/app/Layout'           // ← новый импорт
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { RegisterClientStep1Page } from '@/pages/register-client/step1'
import { RegisterClientVerifyPage } from '@/pages/register-client/verify'
import { RegisterClientProfilePage } from '@/pages/register-client/profile'
import { ForgotPasswordEmailPage } from '@/pages/forgot-password/email'
import { ForgotPasswordVerifyPage } from '@/pages/forgot-password/verify'
import { ForgotPasswordResetPage } from '@/pages/forgot-password/reset';

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
      { path: '/forgot-password',
        element: <ForgotPasswordEmailPage />
      },
      { path: '/forgot-password/verify',
        element: <ForgotPasswordVerifyPage />
      },
      { path: '/forgot-password/reset',
        element: <ForgotPasswordResetPage />
      },
    ],
  },
]