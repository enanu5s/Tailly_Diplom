import { registerApi } from '../api/registerApi';
import { registerFlowStore } from './registerFlowStore';
import { authStore } from './authStore.ts';

export const registerService = {
  async start(email: string, password: string) {
    const res = await registerApi.startRegister({ email, password });
    registerFlowStore.setStart(email, res.registrationId);
    return res;
  },

  async verify(registrationId: string, code: string) {
    const res = await registerApi.verifyCode({ registrationId, code });
    registerFlowStore.setVerified(res.verificationToken);
    return res;
  },

  async loadCities() {
    return registerApi.getCities();
  },

  async complete(verificationToken: string, firstName: string, lastName: string, cityId: string) {
    const res = await registerApi.completeProfile({ verificationToken, firstName, lastName, cityId });
    authStore.setAuth(res.accessToken, res.user);
    registerFlowStore.reset();
    return res;
  },

  resetFlow() {
    registerFlowStore.reset();
  },
};