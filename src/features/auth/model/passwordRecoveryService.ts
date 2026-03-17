// /src/features/auth/model/passwordRecoveryService.ts
import { passwordRecoveryFlowStore } from './passwordRecoveryFlowStore';
import { passwordRecoveryApi } from '../api/passwordRecoveryApi';


export const passwordRecoveryService = {
  async sendCode(email: string): Promise<void> {
    await passwordRecoveryApi.sendCode({ email });
    passwordRecoveryFlowStore.setStart(email);
  },

  async verifyCode(code: string): Promise<void> {
    const { email } = passwordRecoveryFlowStore.getState();

    if (!email) {
      throw new Error('Не указан email для восстановления пароля.');
    }

    await passwordRecoveryApi.verifyCode({ email, code });
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