// src/features/auth/model/useAuth.ts
import { useSyncExternalStore } from 'react';
import { authStore } from './authStore';

export function useAuth() {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState);
  return {
    token: state.token,
    user: state.user,
    isAuth: Boolean(state.token),
    logout: authStore.logout,
  };
}