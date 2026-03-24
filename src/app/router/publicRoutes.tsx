// src/app/router/publicRoutes.tsx
import { lazy } from 'react';

import { withSuspense } from './withSuspense';

import type { RouteObject } from 'react-router-dom';

const HomePage = lazy(() =>
  import('@/pages/home').then((module) => ({ default: module.HomePage })),
);

const LoginPage = lazy(() =>
  import('@/pages/login').then((module) => ({ default: module.LoginPage })),
);

const RegisterPage = lazy(() =>
  import('@/pages/register').then((module) => ({
    default: module.RegisterPage,
  })),
);

const RegisterClientStep1Page = lazy(() =>
  import('@/pages/register-client/step1').then((module) => ({
    default: module.RegisterClientStep1Page,
  })),
);

const RegisterClientVerifyPage = lazy(() =>
  import('@/pages/register-client/verify').then((module) => ({
    default: module.RegisterClientVerifyPage,
  })),
);

const RegisterClientProfilePage = lazy(() =>
  import('@/pages/register-client/profile').then((module) => ({
    default: module.RegisterClientProfilePage,
  })),
);

const ForgotPasswordEmailPage = lazy(() =>
  import('@/pages/forgot-password/email').then((module) => ({
    default: module.ForgotPasswordEmailPage,
  })),
);

const ForgotPasswordVerifyPage = lazy(() =>
  import('@/pages/forgot-password/verify').then((module) => ({
    default: module.ForgotPasswordVerifyPage,
  })),
);

const ForgotPasswordResetPage = lazy(() =>
  import('@/pages/forgot-password/reset').then((module) => ({
    default: module.ForgotPasswordResetPage,
  })),
);

const BecomeSpecialistPage = lazy(() =>
  import('@/pages/become-specialist').then((module) => ({
    default: module.BecomeSpecialistPage,
  })),
);

const BecomeSpecialistFormPage = lazy(() =>
  import('@/pages/become-specialist-form').then((module) => ({
    default: module.BecomeSpecialistFormPage,
  })),
);

const AboutPage = lazy(() =>
  import('@/pages/about').then((module) => ({ default: module.AboutPage })),
);

const PostsPage = lazy(() =>
  import('@/pages/posts').then((module) => ({ default: module.PostsPage })),
);

const PostPage = lazy(() =>
  import('@/pages/post').then((module) => ({ default: module.PostPage })),
);

const ServicesPage = lazy(() =>
  import('@/pages/services').then((module) => ({
    default: module.ServicesPage,
  })),
);

const SpecialistProfilePage = lazy(() =>
  import('@/pages/specialist-profile').then((module) => ({
    default: module.SpecialistProfilePage,
  })),
);

const PrivacyPolicyPage = lazy(() =>
  import('@/pages/privacy-policy').then((module) => ({
    default: module.PrivacyPolicyPage,
  })),
);

const UserAgreementPage = lazy(() =>
  import('@/pages/user-agreement').then((module) => ({
    default: module.UserAgreementPage,
  })),
);

const PublicOfferPage = lazy(() =>
  import('@/pages/public-offer').then((module) => ({
    default: module.PublicOfferPage,
  })),
);

const RefundPolicyPage = lazy(() =>
  import('@/pages/refund-policy').then((module) => ({
    default: module.RefundPolicyPage,
  })),
);

const AgencyContractPage = lazy(() =>
  import('@/pages/agency-contract').then((module) => ({
    default: module.AgencyContractPage,
  })),
);

const ShopOrdersPage = lazy(() =>
  import('@/pages/shop-orders').then((module) => ({
    default: module.ShopOrdersPage,
  })),
);

const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((module) => ({
    default: module.NotFoundPage,
  })),
);

const RestoreAccountPage = lazy(() =>
  import('@/pages/account-restore').then((module) => ({
    default: module.RestoreAccountPage,
  })),
);

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: withSuspense(<HomePage />),
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/register',
    element: withSuspense(<RegisterPage />),
  },
  {
    path: '/register/client',
    element: withSuspense(<RegisterClientStep1Page />),
  },
  {
    path: '/register/client/verify',
    element: withSuspense(<RegisterClientVerifyPage />),
  },
  {
    path: '/register/client/profile',
    element: withSuspense(<RegisterClientProfilePage />),
  },
  {
    path: '/forgot-password',
    element: withSuspense(<ForgotPasswordEmailPage />),
  },
  {
    path: '/forgot-password/verify',
    element: withSuspense(<ForgotPasswordVerifyPage />),
  },
  {
    path: '/forgot-password/reset',
    element: withSuspense(<ForgotPasswordResetPage />),
  },
  {
    path: '/become-specialist',
    element: withSuspense(<BecomeSpecialistPage />),
  },
  {
    path: '/become-specialist/form',
    element: withSuspense(<BecomeSpecialistFormPage />),
  },
  {
    path: '/about',
    element: withSuspense(<AboutPage />),
  },
  {
    path: '/posts',
    element: withSuspense(<PostsPage />),
  },
  {
    path: '/posts/:postId',
    element: withSuspense(<PostPage />),
  },
  {
    path: '/services',
    element: withSuspense(<ServicesPage />),
  },
  {
    path: '/specialists/:specialistSlug',
    element: withSuspense(<SpecialistProfilePage />),
  },
  {
    path: '/privacy-policy',
    element: withSuspense(<PrivacyPolicyPage />),
  },
  {
    path: '/user-agreement',
    element: withSuspense(<UserAgreementPage />),
  },
  {
    path: '/public-offer',
    element: withSuspense(<PublicOfferPage />),
  },
  {
    path: '/refund-policy',
    element: withSuspense(<RefundPolicyPage />),
  },
  {
    path: '/agency-contract',
    element: withSuspense(<AgencyContractPage />),
  },
  {
    path: '/shop/orders',
    element: withSuspense(<ShopOrdersPage />),
  },
  {
    path: '/account/restore/:token',
    element: withSuspense(<RestoreAccountPage />),
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
];
