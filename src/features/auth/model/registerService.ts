// src/features/auth/model/registerService.ts

import { registerFlowStore } from './registerFlowStore';
import { registerApi } from '../api/registerApi';

type PendingProfileDraft = {
  firstName: string;
  lastName: string;
  middleName?: string;
  cityId: string;
  cityName?: string;
  completedAt: string;
};

const PENDING_PROFILE_KEY = 'tailly_pending_profile_after_register';

export const registerService = {
  async start(email: string, password: string) {
    const normalizedEmail = email.trim();

    const res = await registerApi.startRegister({
      email: normalizedEmail,
      password,
    });

    registerFlowStore.setStart(normalizedEmail, res.registrationId);

    return res;
  },

  async verify(registrationId: string, code: string) {
    const res = await registerApi.verifyCode({
      registrationId,
      code,
    });

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
    await registerApi.completeProfile({
      verificationToken,
      firstName,
      lastName,
      middleName: middleName.trim() || undefined,
      cityId,
      cityName: cityName?.trim() || undefined,
    });

    const pendingProfileDraft: PendingProfileDraft = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim() || undefined,
      cityId,
      cityName: cityName?.trim() || undefined,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(pendingProfileDraft));
    registerFlowStore.reset();

    return {
      success: true as const,
    };
  },

  resetFlow() {
    registerFlowStore.reset();
  },
};