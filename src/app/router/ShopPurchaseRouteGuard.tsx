// src/app/router/ShopPurchaseRouteGuard.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
  canOrderShopProducts,
  getDefaultAuthorizedRoute,
} from '@/shared/lib/auth/roleAccess';

export const ShopPurchaseRouteGuard = () => {
  const location = useLocation();
  const { isAuth, user } = useAuth();

  if (!isAuth || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canOrderShopProducts(user)) {
    return <Navigate to={getDefaultAuthorizedRoute(user)} replace />;
  }

  return <Outlet />;
};
