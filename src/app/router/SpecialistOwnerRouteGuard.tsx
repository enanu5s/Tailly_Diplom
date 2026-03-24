// src/app/router/SpecialistOwnerRouteGuard.tsx

import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';

function normalizeSlug(value?: string): string {
  return value?.trim().toLowerCase() ?? '';
}

export const SpecialistOwnerRouteGuard = () => {
  const { isAuth, isSpecialist, user } = useAuth();
  const location = useLocation();
  const { specialistSlug } = useParams<{ specialistSlug: string }>();

  const routeSlug = normalizeSlug(specialistSlug);
  const userSlug = normalizeSlug(user?.specialistSlug);

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isSpecialist) {
    return <Navigate to="/" replace />;
  }

  if (!routeSlug || !userSlug || routeSlug !== userSlug) {
    return <Navigate to={`/specialists/${specialistSlug ?? ''}`} replace />;
  }

  return <Outlet />;
};
