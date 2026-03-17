// src/features/auth/api/passwordRecoveryApi.mock.ts

import {
  createSession,
  deleteSession,
  getSession,
  wait,
} from '../data/mockPasswordRecovery';
import {
  PasswordRecoveryError,
  type SendRecoveryCodePayload,
  type VerifyRecoveryCodePayload,
  type ResetPasswordPayload,
} from '../model/types';

export const passwordRecoveryMockApi = {
  async sendCode(payload: SendRecoveryCodePayload): Promise<void> {
    await wait();

    const email = payload.email.trim().toLowerCase();

    if (!email.includes('@')) {
      throw new PasswordRecoveryError('Некорректный email');
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
      throw new PasswordRecoveryError('Неверный код');
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await wait();

    const session = getSession(payload.email);

    if (!session) {
      throw new PasswordRecoveryError('Сессия не найдена');
    }

    deleteSession(payload.email);

    // здесь просто имитируем смену пароля
  },
};