// src/app/router/AllowedRolesRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import type { UserRole } from '@/features/auth/model/authStore';
import { useAuth } from '@/features/auth/model/useAuth';

type AllowedRolesRouteProps = {
  roles: UserRole[];
  redirectTo?: string;
};

export const AllowedRolesRoute = ({
  roles,
  redirectTo = '/',
}: AllowedRolesRouteProps) => {
  const location = useLocation();
  const { isAuth, user } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};