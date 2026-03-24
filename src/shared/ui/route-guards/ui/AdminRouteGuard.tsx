// src/shared/ui/route-guards/AdminRouteGuard.tsx

import { useSyncExternalStore } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { authStore } from '@/features/auth/model/authStore';
import {
  canAccessAdminArea,
  canAccessSuperAdminArea,
} from '@/shared/lib/auth/roleAccess';

import type { ReactNode, ReactElement } from 'react';

type Props = {
  children: ReactNode;
  requireSuperAdmin?: boolean;
};

export function AdminRouteGuard({
  children,
  requireSuperAdmin = false,
}: Props): ReactElement {
  const location = useLocation();
  const authState = useSyncExternalStore(authStore.subscribe, authStore.getState);

  const hasAccess = requireSuperAdmin
    ? canAccessSuperAdminArea(authState.user)
    : canAccessAdminArea(authState.user);

  if (!hasAccess) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
