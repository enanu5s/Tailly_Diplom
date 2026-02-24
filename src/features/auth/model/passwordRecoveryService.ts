//src/features/auth/model/passwordRecoveryService.ts

import { passwordRecoveryApi } from '../api/passwordRecoveryApi';
import { passwordRecoveryFlowStore } from './passwordRecoveryFlowStore';

export const passwordRecoveryService = {
  async start(email: string) {
    const res = await passwordRecoveryApi.start({ email });
    passwordRecoveryFlowStore.setStart(email, res.recoveryId);
    return res;
  },

  async verify(recoveryId: string, code: string) {
    const res = await passwordRecoveryApi.verifyCode({ recoveryId, code });
    passwordRecoveryFlowStore.setVerified(res.resetToken);
    return res;
  },

  async reset(resetToken: string, newPassword: string) {
    const res = await passwordRecoveryApi.resetPassword({ resetToken, newPassword });
    passwordRecoveryFlowStore.reset();
    return res;
  },

  resetFlow() {
    passwordRecoveryFlowStore.reset();
  },
};