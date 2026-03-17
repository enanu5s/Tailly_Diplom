//src/features/admin-auth/api/adminAuthApi.mock.ts

import {
  AdminLoginError,
  type AdminLoginPayload,
  type AdminLoginSuccessResponse,
} from '../model/types';

import {
  attemptsMap,
  buildLockedUntilIso,
  getAttemptState,
  mapAccountToLoginSuccess,
  MAX_LOGIN_ATTEMPTS,
  MOCK_ADMIN_ACCOUNTS,
  normalizeEmail,
  resetAttempts,
  wait,
} from '../data/mockAdminAccounts';

export async function mockAdminLogin(
  payload: AdminLoginPayload,
): Promise<AdminLoginSuccessResponse> {
  await wait();

  const email = normalizeEmail(payload.email);
  const password = payload.password;
  const attempts = getAttemptState(email);

  if (
    attempts.lockUntil &&
    new Date(attempts.lockUntil).getTime() > Date.now()
  ) {
    throw new AdminLoginError({
      code: 'TOO_MANY_ATTEMPTS',
      message:
        'Слишком много неверных попыток входа. Попробуйте позже или обратитесь к главному администратору.',
      attemptsLeft: 0,
      lockUntil: attempts.lockUntil,
    });
  }

  const account =
    MOCK_ADMIN_ACCOUNTS.find((item) => item.email.toLowerCase() === email) ??
    null;

  if (!account || account.password !== password) {
    const nextFailedAttempts = attempts.failedAttempts + 1;
    const attemptsLeft = Math.max(MAX_LOGIN_ATTEMPTS - nextFailedAttempts, 0);

    if (attemptsLeft <= 0) {
      const lockUntil = buildLockedUntilIso();

      attemptsMap.set(email, {
        failedAttempts: MAX_LOGIN_ATTEMPTS,
        lockUntil,
      });

      throw new AdminLoginError({
        code: 'TOO_MANY_ATTEMPTS',
        message: 'Лимит попыток входа исчерпан. Вход временно заблокирован.',
        attemptsLeft: 0,
        lockUntil,
      });
    }

    attemptsMap.set(email, {
      failedAttempts: nextFailedAttempts,
      lockUntil: null,
    });

    throw new AdminLoginError({
      code: 'INVALID_CREDENTIALS',
      message: 'Неверный логин или пароль.',
      attemptsLeft,
      lockUntil: null,
    });
  }

  if (account.isBlocked) {
    throw new AdminLoginError({
      code: 'ACCOUNT_BLOCKED',
      message: 'Аккаунт администратора заблокирован.',
    });
  }

  resetAttempts(email);

  return mapAccountToLoginSuccess(account);
}