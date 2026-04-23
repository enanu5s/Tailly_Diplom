// src/features/auth/service/authService.ts
import { adminProfileStore } from '@/features/admin-profile';
import { HttpError } from '@/shared/api/http';

import { authStore, type AuthUser } from '@/features/auth/model/authStore';
import { LoginError } from '@/features/auth/model/types';
import { authApi } from '../api/authApi';

import type { LoginPayload } from '../model/types';

const LOGIN_ROLE_ATTEMPTS: Array<NonNullable<LoginPayload['requestedRole']>> = [
  'client',
  'specialist',
  'super_admin',
  'admin',
];

function isLikelyAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.includes('admin');
}

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

function mapHttpErrorToLoginError(error: HttpError): LoginError | null {
  switch (error.code) {
    case 'Auth.AccountBlocked':
      return new LoginError({
        code: 'ACCOUNT_BLOCKED',
        message: 'Ваш аккаунт заблокирован. Подробности отправлены на почту.',
      });
    case 'Auth.InvalidCredentials':
      return new LoginError({
        code: 'INVALID_CREDENTIALS',
        message: 'Неверный email или пароль.',
      });
    case 'Auth.InvalidRole':
      return new LoginError({
        code: 'INVALID_ROLE',
        message: 'Для этого аккаунта недоступна выбранная роль входа.',
      });
    case 'Auth.AccountPendingDeletion':
      return new LoginError({
        code: 'ACCOUNT_PENDING_DELETION',
        message: 'Аккаунт запланирован к удалению. Подробности отправлены на почту.',
      });
    default:
      return null;
  }
}

export const authService = {
  async login(dto: LoginPayload) {
    const roleAttempts = isLikelyAdminEmail(dto.email)
      ? [
          'super_admin',
          'admin',
          ...LOGIN_ROLE_ATTEMPTS.filter((role) => role !== 'super_admin' && role !== 'admin'),
        ]
      : dto.requestedRole
        ? [
            dto.requestedRole,
            ...LOGIN_ROLE_ATTEMPTS.filter((role) => role !== dto.requestedRole),
          ]
        : LOGIN_ROLE_ATTEMPTS;
    let res: Awaited<ReturnType<typeof authApi.login>> | null = null;
    let resolvedRole: NonNullable<LoginPayload['requestedRole']> = roleAttempts[0]!;
    let lastError: unknown = null;

    for (const role of roleAttempts) {
      try {
        res = await authApi.login({
          email: dto.email,
          password: dto.password,
          requestedRole: role,
        });
        resolvedRole = role;
        break;
      } catch (error) {
        if (!(error instanceof HttpError) || error.code !== 'Auth.InvalidRole') {
          if (error instanceof HttpError) {
            const loginError = mapHttpErrorToLoginError(error);
            if (loginError) {
              throw loginError;
            }
          }
          throw error;
        }

        lastError = error;
      }
    }

    if (!res) {
      throw (lastError instanceof Error ? lastError : new Error('Не удалось выполнить вход.'));
    }

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
      role: resolvedRole,
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