// src/app/router/adminRoutes.tsx

import { lazy } from 'react';

import { AdminForgotPasswordPage } from '@/pages/admin-forgot-password/ui/AdminForgotPasswordPage';
import { PlaceholderAdminPage } from '@/shared/ui/placeholders/PlaceholderAdminPage';
import { AdminRouteGuard } from '@/shared/ui/route-guards/ui/AdminRouteGuard';

import { withSuspense } from './withSuspense';

import type { RouteObject } from 'react-router-dom';

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin-dashboard/ui/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);

const AdminLoginPage = lazy(() =>
  import('@/pages/admin-login/ui/AdminLoginPage').then((module) => ({
    default: module.AdminLoginPage,
  })),
);

const AdminProfilePage = lazy(() =>
  import('@/pages/admin-profile/ui/AdminProfilePage').then((module) => ({
    default: module.AdminProfilePage,
  })),
);

const SuperAdminAdminsPage = lazy(() =>
  import('@/pages/super-admin-admins').then((module) => ({
    default: module.SuperAdminAdminsPage,
  })),
);

const AdminSpecialistApplicationsPage = lazy(() =>
  import('@/pages/admin-specialist-applications').then((module) => ({
    default: module.AdminSpecialistApplicationsPage,
  })),
);

const SuperAdminPasswordRecoveryPage = lazy(() =>
  import('@/pages/super-admin-password-recovery/ui/SuperAdminPasswordRecoveryPage').then(
    (module) => ({
      default: module.SuperAdminPasswordRecoveryPage,
    }),
  ),
);

const AdminUsersPage = lazy(() =>
  import('@/pages/admin-users/ui/AdminUsersPage').then((module) => ({
    default: module.AdminUsersPage,
  })),
);

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin/login',
    element: withSuspense(<AdminLoginPage />),
  },
  {
    path: '/admin/forgot-password',
    element: <AdminForgotPasswordPage />,
  },
  {
    path: '/admin',
    element: (
      <AdminRouteGuard>
        {withSuspense(<AdminDashboardPage />)}
      </AdminRouteGuard>
    ),
  },
  {
    path: '/admin/profile',
    element: (
      <AdminRouteGuard>
        {withSuspense(<AdminProfilePage />)}
      </AdminRouteGuard>
    ),
  },
  {
    path: '/admin/moderation/specialists',
    element: (
      <AdminRouteGuard>
        {withSuspense(<AdminSpecialistApplicationsPage />)}
      </AdminRouteGuard>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <AdminRouteGuard>
        {withSuspense(<AdminUsersPage />)}
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
        {withSuspense(<SuperAdminAdminsPage />)}
      </AdminRouteGuard>
    ),
  },
  {
    path: '/super-admin/password-recovery',
    element: (
      <AdminRouteGuard requireSuperAdmin>
        {withSuspense(<SuperAdminPasswordRecoveryPage />)}
      </AdminRouteGuard>
    ),
  },
];