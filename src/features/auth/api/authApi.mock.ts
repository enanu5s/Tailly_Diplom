//src/features/auth/api/authApi.mock.ts

import {
  adminAttemptsMap,
  buildAdminLockUntilIso,
  getAdminAttemptState,
  getMockAuthAccounts,
  hasAdminRole,
  mapAccountToLoginSuccess,
  MAX_ADMIN_LOGIN_ATTEMPTS,
  normalizeEmail,
  resetAdminAttempts,
  syncBlockedState,
  wait,
} from '../data/mockAuthAccounts';
import type { UserRole } from '../model/authStore';
import {
  LoginError,
  type LoginPayload,
  type LoginSuccessResponse,
} from '../model/types';

function resolveAdminSessionRole(roles: UserRole[]): 'admin' | 'super_admin' {
  return roles.includes('super_admin') ? 'super_admin' : 'admin';
}

export async function mockLogin(
  payload: LoginPayload,
): Promise<LoginSuccessResponse> {
  await wait();

  const email = normalizeEmail(payload.email);
  const password = payload.password;
  const requestedRole = payload.requestedRole;

  const account =
    getMockAuthAccounts().find(
      (item) => item.email.toLowerCase() === email,
    ) ?? null;

  if (account) {
    syncBlockedState(account);
  }

  const isAdminAccount = Boolean(
    account && hasAdminRole(account.roles),
  );

  if (isAdminAccount) {
    const attemptState = getAdminAttemptState(email);

    if (
      attemptState.lockUntil &&
      new Date(attemptState.lockUntil).getTime() > Date.now()
    ) {
      throw new LoginError({
        code: 'TOO_MANY_ATTEMPTS',
        message:
          'Лимит попыток для администратора исчерпан. Попробуйте позже.',
        attemptsLeft: 0,
        lockUntil: attemptState.lockUntil,
      });
    }
  }

  if (!account || account.password !== password) {
    if (isAdminAccount) {
      const attemptState = getAdminAttemptState(email);
      const nextFailedAttempts = attemptState.failedAttempts + 1;
      const attemptsLeft = Math.max(
        MAX_ADMIN_LOGIN_ATTEMPTS - nextFailedAttempts,
        0,
      );

      if (attemptsLeft <= 0) {
        const lockUntil = buildAdminLockUntilIso();

        adminAttemptsMap.set(email, {
          failedAttempts: MAX_ADMIN_LOGIN_ATTEMPTS,
          lockUntil,
        });

        throw new LoginError({
          code: 'TOO_MANY_ATTEMPTS',
          message:
            'Лимит попыток для администратора исчерпан. Вход временно заблокирован.',
          attemptsLeft: 0,
          lockUntil,
        });
      }

      adminAttemptsMap.set(email, {
        failedAttempts: nextFailedAttempts,
        lockUntil: null,
      });

      throw new LoginError({
        code: 'INVALID_CREDENTIALS',
        message: 'Неверный логин или пароль.',
        attemptsLeft,
        lockUntil: null,
      });
    }

    throw new LoginError({
      code: 'INVALID_CREDENTIALS',
      message: 'Неверный логин или пароль.',
    });
  }

  if (account.isBlocked) {
    throw new LoginError({
      code: 'ACCOUNT_BLOCKED',
      message: 'Аккаунт заблокирован.',
    });
  }

  if (hasAdminRole(account.roles)) {
    resetAdminAttempts(email);
    return mapAccountToLoginSuccess(
      account,
      resolveAdminSessionRole(account.roles),
    );
  }

  if (!account.roles.includes(requestedRole)) {
    throw new LoginError({
      code: 'INVALID_ROLE',
      message:
        requestedRole === 'specialist'
          ? 'Этот аккаунт не зарегистрирован как специалист.'
          : 'Этот аккаунт не зарегистрирован как клиент.',
    });
  }

  return mapAccountToLoginSuccess(account, requestedRole);
}