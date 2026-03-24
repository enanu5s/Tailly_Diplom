// src/app/router/ClientRouteGuard.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
  canAccessClientArea,
  getDefaultAuthorizedRoute,
} from '@/shared/lib/auth/roleAccess';

export const ClientRouteGuard = () => {
  const location = useLocation();
  const { isAuth, user } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessClientArea(user)) {
    return <Navigate to={getDefaultAuthorizedRoute(user)} replace />;
  }

  return <Outlet />;
};
