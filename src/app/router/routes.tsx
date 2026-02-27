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
import { ForgotPasswordResetPage } from '@/pages/forgot-password/reset'
import { BecomeSpecialistPage } from '@/pages/become-specialist'
import { BecomeSpecialistFormPage } from '@/pages/become-specialist-form'
import { AboutPage } from '@/pages/about'
import { PostsPage } from '@/pages/posts'
import { PostPage } from '@/pages/post'
import { ProfilePage } from '@/pages/profile'
import { ChangeEmailPage } from '@/pages/profile-security-email'
import { ChangePasswordPage} from '@/pages/profile-security-password'
import { LeaveReviewPage } from '@/pages/leave-review';

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
      {
        path: '/register/client',
        element: <RegisterClientStep1Page />
      },
      {
        path: '/register/client/verify',
        element: <RegisterClientVerifyPage />
      },
      {
        path: '/register/client/profile',
        element: <RegisterClientProfilePage />
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordEmailPage />
      },
      {
        path: '/forgot-password/verify',
        element: <ForgotPasswordVerifyPage />
      },
      {
        path: '/forgot-password/reset',
        element: <ForgotPasswordResetPage />
      },
      {
        path: '/become-specialist',
        element: <BecomeSpecialistPage />
      },
      {
        path: '/become-specialist/form',
        element: <BecomeSpecialistFormPage />
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/posts',
        element: <PostsPage />,
      },
      {
        path: '/posts/:postId',
        element: <PostPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/profile/security/email',
        element: <ChangeEmailPage />,
      },
      {
        path: '/profile/security/password',
        element: <ChangePasswordPage />,
      },
      {
        path: '/profile/review/:orderId',
        element: <LeaveReviewPage />,
      },
    ],
  },
]