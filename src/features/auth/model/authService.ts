// src/features/auth/service/authService.ts
import { adminProfileStore } from '@/features/admin-profile';

import { authStore } from './authStore';
import { authApi } from '../api/authApi';

import type { LoginPayload } from './types';

export const authService = {
  async login(dto: LoginPayload) {
    const res = await authApi.login(dto);
    authStore.setAuth(res.accessToken, res.user);
    return res;
  },

  logout() {
    adminProfileStore.reset();
    authStore.logout();
  },

  buildLoginRedirectPath(from?: string): string {
    const normalizedFrom = typeof from === 'string' ? from.trim() : '';

    if (!normalizedFrom || normalizedFrom === '/login') {
      return '/login';
    }

    return `/login?from=${encodeURIComponent(normalizedFrom)}`;
  },
};
