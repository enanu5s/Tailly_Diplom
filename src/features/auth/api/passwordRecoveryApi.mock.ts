// src/features/auth/api/passwordRecoveryApi.mock.ts

import {
  createSession,
  deleteSession,
  getSession,
} from '../data/mockPasswordRecovery';
import {
  MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS,
  buildRecoveryRequestId,
  findPendingAdminPasswordRecoveryRequestByEmail,
  wait,
} from '../data/mockAdminPasswordRecoveryRequests';
import { getActiveSoftDeleteRecord } from '../data/mockAccountDeletionStorage';
import {
  getMockAuthAccounts,
  hasAdminRole,
  normalizeEmail,
} from '../data/mockAuthAccounts';
import {
  PasswordRecoveryError,
  type ResetPasswordPayload,
  type SendRecoveryCodePayload,
  type StartPasswordRecoveryPayload,
  type StartPasswordRecoveryResponse,
  type VerifyRecoveryCodePayload,
} from '../model/types';

function findAccountByEmail(email: string) {
  const normalized = normalizeEmail(email);

  return (
    getMockAuthAccounts().find(
      (item) => item.email.toLowerCase() === normalized,
    ) ?? null
  );
}

export const passwordRecoveryMockApi = {
  async startRecovery(
    payload: StartPasswordRecoveryPayload,
  ): Promise<StartPasswordRecoveryResponse> {
    await wait();

    const normalizedEmail = normalizeEmail(payload.email);

    if (!normalizedEmail.includes('@')) {
      throw new PasswordRecoveryError('Некорректный email');
    }

    const account = findAccountByEmail(normalizedEmail);

    if (!account) {
      throw new PasswordRecoveryError(
        'Пользователь с таким email не найден.',
      );
    }

    if (account.isBlocked) {
      throw new PasswordRecoveryError('Аккаунт заблокирован.');
    }

    if (getActiveSoftDeleteRecord(account.id)) {
      throw new PasswordRecoveryError(
        'Аккаунт запланирован к удалению. Используйте ссылку восстановления из письма.',
      );
    }

    if (hasAdminRole(account.roles)) {
      const existingPendingRequest =
        findPendingAdminPasswordRecoveryRequestByEmail(normalizedEmail);

      if (existingPendingRequest) {
        throw new PasswordRecoveryError(
          'Заявка на восстановление пароля уже отправлена главному администратору. Дождитесь обработки текущей заявки.',
        );
      }

      MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS.unshift({
        id: buildRecoveryRequestId(),
        email: normalizedEmail,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      });

      return {
        flow: 'admin',
      };
    }

    createSession(normalizedEmail);

    return {
      flow: 'default',
    };
  },

  async sendCode(payload: SendRecoveryCodePayload): Promise<void> {
    await wait();

    const email = normalizeEmail(payload.email);

    if (!email.includes('@')) {
      throw new PasswordRecoveryError('Некорректный email');
    }

    const account = findAccountByEmail(email);

    if (!account) {
      throw new PasswordRecoveryError(
        'Пользователь с таким email не найден.',
      );
    }

    if (hasAdminRole(account.roles)) {
      throw new PasswordRecoveryError(
        'Для администратора используется отдельный сценарий восстановления пароля.',
      );
    }

    createSession(email);
  },

  async verifyCode(payload: VerifyRecoveryCodePayload): Promise<void> {
    await wait();

    const session = getSession(payload.email);

    if (!session) {
      throw new PasswordRecoveryError('Код не найден');
    }

    if (Date.now() > session.expiresAt) {
      deleteSession(payload.email);
      throw new PasswordRecoveryError('Код истёк');
    }

    if (session.code !== payload.code) {
      throw new PasswordRecoveryError(
        `Неверный код. Тестовый код: ${session.code}`,
      );
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await wait();

    const session = getSession(payload.email);

    if (!session) {
      throw new PasswordRecoveryError('Сессия не найдена');
    }

    deleteSession(payload.email);

    // здесь только имитируется смена пароля
  },
};