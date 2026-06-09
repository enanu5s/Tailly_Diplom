// src/app/router/ConsumerAccountRouteGuard.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { getDefaultAuthorizedRoute } from '@/shared/lib/auth/roleAccess';

export const ConsumerAccountRouteGuard = () => {
  const location = useLocation();
  const { isAuth, user } = useAuth();

  if (!isAuth || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.isBlocked) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'client' && user.role !== 'specialist') {
    return <Navigate to={getDefaultAuthorizedRoute(user)} replace />;
  }

  return <Outlet />;
};
