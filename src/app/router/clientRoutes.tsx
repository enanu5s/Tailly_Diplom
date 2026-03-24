// src/app/router/clientRoutes.tsx

import { lazy } from 'react';

import { ClientRouteGuard } from '@/app/router/ClientRouteGuard';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { SpecialistOwnerRouteGuard } from '@/app/router/SpecialistOwnerRouteGuard';

import { withSuspense } from './withSuspense';

import type { RouteObject } from 'react-router-dom';

const ProfilePage = lazy(() =>
  import('@/pages/profile').then((module) => ({
    default: module.ProfilePage,
  })),
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

const ServiceBookingPage = lazy(() =>
  import('@/pages/service-booking/ui/ServiceBookingPage').then((module) => ({
    default: module.ServiceBookingPage,
  })),
);

const SpecialistCalendarEditPage = lazy(() =>
  import('@/pages/specialist-calendar-edit').then((module) => ({
    default: module.SpecialistCalendarEditPage,
  })),
);

const SpecialistReviewsPage = lazy(() =>
  import('@/pages/specialist-reviews').then((module) => ({
    default: module.SpecialistReviewsPage,
  })),
);

const SpecialistOrdersPage = lazy(() =>
  import('@/pages/specialist-orders').then((module) => ({
    default: module.SpecialistOrdersPage,
  })),
);

const SpecialistClientProfilePage = lazy(() =>
  import('@/pages/specialist-client').then((module) => ({
    default: module.SpecialistClientProfilePage,
  })),
);

const MessagesPage = lazy(() =>
  import('@/pages/messages').then((module) => ({
    default: module.MessagesPage,
  })),
);

export const clientRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/messages',
        element: withSuspense(<MessagesPage />),
      },
    ],
  },
  {
    element: <ClientRouteGuard />,
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
      {
        path: '/service-booking',
        element: withSuspense(<ServiceBookingPage />),
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
      {
        path: '/specialists/:specialistSlug/reviews',
        element: withSuspense(<SpecialistReviewsPage />),
      },
      {
        path: '/specialists/:specialistSlug/orders',
        element: withSuspense(<SpecialistOrdersPage />),
      },
      {
        path: '/specialists/:specialistSlug/clients/:clientId',
        element: withSuspense(<SpecialistClientProfilePage />),
      },
    ],
  },
];