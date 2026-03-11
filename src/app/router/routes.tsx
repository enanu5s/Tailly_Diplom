// src/app/router/routes.tsx
import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/app/Layout'
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
import { ChangePasswordPage } from '@/pages/profile-security-password'
import { LeaveReviewPage } from '@/pages/leave-review'
import { ServicesPage } from '@/pages/services'
import { NotFoundPage } from '@/pages/not-found'
import {
  ShopCartPage,
  ShopCatalogPage,
  ShopCheckoutPage,
  ShopFavoritesPage,
  ShopOrderResultPage,
  ShopProductPage,
} from '@/pages/shop';
import { SpecialistProfilePage } from '@/pages/specialist-profile'
import { SpecialistCalendarEditPage } from '@/pages/specialist-calendar-edit'
import { AdminDashboardPage } from '@/pages/admin-dashboard/ui/AdminDashboardPage';
import { AdminLoginPage } from '@/pages/admin-login/ui/AdminLoginPage';
import { AdminProfilePage } from '@/pages/admin-profile/ui/AdminProfilePage';
import { AdminRouteGuard } from '@/shared/ui/route-guards/ui/AdminRouteGuard';
import { SuperAdminAdminsPage } from '@/pages/super-admin-admins';
import { AdminSpecialistApplicationsPage } from '@/pages/admin-specialist-applications';

function PlaceholderAdminPage({ title }: { title: string }) {
  return (
    <section style={{ padding: '40px 20px' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <p style={{ marginBottom: 0 }}>
          Раздел будет реализован следующим этапом.
        </p>
      </div>
    </section>
  );
}


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
      {
        path: '/services',
        element: <ServicesPage />,
      },
      {
        path: '/specialists/:specialistSlug',
        element: <SpecialistProfilePage />,
      },
      {
        path: '/specialists/:specialistSlug/calendar/edit',
        element: <SpecialistCalendarEditPage />,
      },
      {
        path: '/shop',
        element: <ShopCatalogPage />,
      },
      {
        path: '/shop/favorites',
        element: <ShopFavoritesPage />,
      },
      {
        path: '/shop/cart',
        element: <ShopCartPage />,
      },
      {
        path: '/shop/checkout',
        element: <ShopCheckoutPage />,
      },
      {
        path: '/shop/order/:orderId',
        element: <ShopOrderResultPage />,
      },
      {
        path: '/shop/:slug',
        element: <ShopProductPage />,
      },
      {
        path: '/admin/login',
        element: <AdminLoginPage />,
      },
      {
        path: '/admin/forgot-password',
        element: <PlaceholderAdminPage title="Восстановление пароля администратора" />,
      },
      {
        path: '/admin',
        element: (
          <AdminRouteGuard>
            <AdminDashboardPage />
          </AdminRouteGuard>
        ),
      },
      {
        path: '/admin/profile',
        element: (
          <AdminRouteGuard>
            <AdminProfilePage />
          </AdminRouteGuard>
        ),
      },
      {
        path: '/admin/moderation/specialists',
        element: (
          <AdminRouteGuard>
            <AdminSpecialistApplicationsPage />
          </AdminRouteGuard>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <AdminRouteGuard>
            <PlaceholderAdminPage title="Управление пользователями" />
          </AdminRouteGuard>
        ),
      },
      {
        path: '/admin/posts',
        element: (
          <AdminRouteGuard>
            <PlaceholderAdminPage title="Посты и баннеры" />
          </AdminRouteGuard>
        ),
      },
      {
        path: '/super-admin/admins',
        element: (
          <AdminRouteGuard requireSuperAdmin>
            <SuperAdminAdminsPage />
          </AdminRouteGuard>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]