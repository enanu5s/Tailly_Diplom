// src/app/router/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';

export const ProtectedRoute = () => {
  const { isAuth } = useAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
