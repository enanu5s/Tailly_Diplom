// src/features/auth/model/registerService.ts

import { authStore } from './authStore';
import { registerFlowStore } from './registerFlowStore';
import { registerApi } from '../api/registerApi';

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

  async complete(
    verificationToken: string,
    firstName: string,
    lastName: string,
    middleName: string,
    cityId: string,
    cityName?: string,
  ) {
    const res = await registerApi.completeProfile({
      verificationToken,
      firstName,
      lastName,
      middleName: middleName.trim() || undefined,
      cityId,
      cityName: cityName?.trim() || undefined,
    });

    authStore.setAuth(res.accessToken, res.user);
    registerFlowStore.reset();

    return res;
  },

  resetFlow() {
    registerFlowStore.reset();
  },
};
