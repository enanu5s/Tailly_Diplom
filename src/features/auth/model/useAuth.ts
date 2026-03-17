// src/features/auth/model/useAuth.ts

import { useSyncExternalStore } from 'react';

import { authStore, type UserRole } from './authStore';

export function useAuth() {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
  );

  const isAuth = Boolean(state.token && state.user);
  const role: UserRole = isAuth ? state.user!.role : 'guest';

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
    hasRole: (targetRole: UserRole) => role === targetRole,
    hasAnyRole: (roles: UserRole[]) => roles.includes(role),
  };
}