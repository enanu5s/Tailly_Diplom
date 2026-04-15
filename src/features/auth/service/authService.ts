// src/features/auth/service/authService.ts
import { adminProfileStore } from '@/features/admin-profile';

import { authStore, type AuthUser } from '@/features/auth/model/authStore';
import { authApi } from '../api/authApi';

import type { LoginPayload } from '../model/types';

function readStringField(
  source: Record<string, unknown>,
  camelKey: string,
  pascalKey: string,
): string | null {
  const camelValue = source[camelKey];
  if (typeof camelValue === 'string' && camelValue.trim()) {
    return camelValue;
  }

  const pascalValue = source[pascalKey];
  if (typeof pascalValue === 'string' && pascalValue.trim()) {
    return pascalValue;
  }

  return null;
}

export const authService = {
  async login(dto: LoginPayload) {
    const res = await authApi.login(dto);
    const responseRecord = res as unknown as Record<string, unknown>;

    const accessToken = readStringField(responseRecord, 'accessToken', 'AccessToken');
    const refreshToken = readStringField(responseRecord, 'refreshToken', 'RefreshToken');

    if (!accessToken) {
      console.log('[authService.login] unexpected response:', res);
      throw new Error('Бэк не вернул access token в ожидаемом формате');
    }

    const fallbackUser: AuthUser = {
      id: 'authorized-user',
      email: dto.email.trim(),
      role: dto.requestedRole,
    };

    authStore.setAuth({
      token: accessToken,
      refreshToken,
      user: res.user ?? fallbackUser,
    });

    console.log('[authService.login] auth state after setAuth:', authStore.getState());

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