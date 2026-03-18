// src/features/auth/model/passwordRecoveryService.ts

import { passwordRecoveryFlowStore } from './passwordRecoveryFlowStore';
import { passwordRecoveryApi } from '../api/passwordRecoveryApi';

import type {
  StartPasswordRecoveryResponse,
} from './types';

export const passwordRecoveryService = {
  async startRecovery(email: string): Promise<StartPasswordRecoveryResponse> {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await passwordRecoveryApi.startRecovery({
      email: normalizedEmail,
    });

    if (result.flow === 'default') {
      passwordRecoveryFlowStore.setStart(normalizedEmail);
    } else {
      passwordRecoveryFlowStore.reset();
    }

    return result;
  },

  async sendCode(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    await passwordRecoveryApi.sendCode({ email: normalizedEmail });
    passwordRecoveryFlowStore.setStart(normalizedEmail);
  },

  async verifyCode(code: string): Promise<void> {
    const { email } = passwordRecoveryFlowStore.getState();

    if (!email) {
      throw new Error('Не указан email для восстановления пароля.');
    }

    await passwordRecoveryApi.verifyCode({
      email,
      code: code.trim(),
    });

    passwordRecoveryFlowStore.setVerified(code);
  },

  async resetPassword(newPassword: string): Promise<void> {
    const { email, code } = passwordRecoveryFlowStore.getState();

    if (!email) {
      throw new Error('Не указан email для сброса пароля.');
    }

    if (!code) {
      throw new Error('Не указан код подтверждения для сброса пароля.');
    }

    await passwordRecoveryApi.resetPassword({
      email,
      code,
      newPassword,
    });

    passwordRecoveryFlowStore.complete();
  },

  resetFlow(): void {
    passwordRecoveryFlowStore.reset();
  },
};