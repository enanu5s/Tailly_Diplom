// src/app/router/clientRoutes.tsx

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { SpecialistOwnerRouteGuard } from '@/app/router/SpecialistOwnerRouteGuard';

import { withSuspense } from './withSuspense';

const ProfilePage = lazy(() =>
  import('@/pages/profile').then((module) => ({ default: module.ProfilePage })),
);

const ChangeEmailPage = lazy(() =>
  import('@/pages/profile-security-email').then((module) => ({
    default: module.ChangeEmailPage,
  })),
);

const ChangePasswordPage = lazy(() =>
  import('@/pages/profile-security-password').then((module) => ({
    default: module.ChangePasswordPage,
  })),
);

const LeaveReviewPage = lazy(() =>
  import('@/pages/leave-review').then((module) => ({
    default: module.LeaveReviewPage,
  })),
);

const SpecialistCalendarEditPage = lazy(() =>
  import('@/pages/specialist-calendar-edit').then((module) => ({
    default: module.SpecialistCalendarEditPage,
  })),
);

export const clientRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/profile',
        element: withSuspense(<ProfilePage />),
      },
      {
        path: '/profile/security/email',
        element: withSuspense(<ChangeEmailPage />),
      },
      {
        path: '/profile/security/password',
        element: withSuspense(<ChangePasswordPage />),
      },
      {
        path: '/profile/review/:orderId',
        element: withSuspense(<LeaveReviewPage />),
      },
    ],
  },
  {
    element: <SpecialistOwnerRouteGuard />,
    children: [
      {
        path: '/specialists/:specialistSlug/calendar/edit',
        element: withSuspense(<SpecialistCalendarEditPage />),
      },
    ],
  },
];