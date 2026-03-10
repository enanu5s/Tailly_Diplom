// src/features/auth/model/useAuth.ts

import { useSyncExternalStore } from 'react';

import { authStore, type AuthRole } from './authStore';

export function useAuth() {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState);

  const isAuth = Boolean(state.token && state.user);
  const role: AuthRole = isAuth ? state.user!.role : 'guest';

  return {
    token: state.token,
    user: state.user,
    role,
    isAuth,
    isGuest: role === 'guest',
    isClient: role === 'client',
    isSpecialist: role === 'specialist',
    isAdmin: role === 'admin',
    isSuperAdmin: role === 'super_admin',
    logout: authStore.logout,
    hasRole: (targetRole: AuthRole) => role === targetRole,
    hasAnyRole: (roles: AuthRole[]) => roles.includes(role),
  };
}