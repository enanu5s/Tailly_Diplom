// src/app/router/ShopCartAuthGuard.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
  getDefaultAuthorizedRoute,
  isAdminRole,
} from '@/shared/lib/auth/roleAccess';

/**
 * Корзина магазина — только для клиента и специалиста (как оформление заказа).
 * Гость перенаправляется на вход; администратор — в админ-панель.
 */
export function ShopCartAuthGuard() {
  const location = useLocation();
  const { isAuth, user } = useAuth();

  if (!isAuth || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isAdminRole(user.role)) {
    return <Navigate to={getDefaultAuthorizedRoute(user)} replace />;
  }

  return <Outlet />;
}
