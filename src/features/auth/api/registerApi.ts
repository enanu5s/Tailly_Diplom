// src/features/auth/api/registerApi.ts

import { request } from '@/shared/api/http';

import {
  mockCompleteProfile,
  mockGetCities,
  mockStartRegister,
  mockVerifyCode,
} from './registerApi.mock';

import type { AuthUser } from '../model/authStore';


const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

export type StartRegisterRequest = {
  email: string;
  password: string;
};

export type StartRegisterResponse = {
  registrationId: string;
};

export type VerifyCodeRequest = {
  registrationId: string;
  code: string;
};

export type VerifyCodeResponse = {
  verificationToken: string;
};

export type City = {
  id: string;
  name: string;
};

export type CompleteProfileRequest = {
  verificationToken: string;
  firstName: string;
  lastName: string;
  cityId: string;
};

export type CompleteProfileResponse = {
  accessToken: string;
  user: AuthUser & {
    cityId: string;
  };
};

async function realStartRegister(
  dto: StartRegisterRequest,
): Promise<StartRegisterResponse> {
  return request<StartRegisterResponse>('/auth/register/start', {
    method: 'POST',
    body: dto,
  });
}

async function realVerifyCode(
  dto: VerifyCodeRequest,
): Promise<VerifyCodeResponse> {
  return request<VerifyCodeResponse>('/auth/register/verify', {
    method: 'POST',
    body: dto,
  });
}

async function realGetCities(): Promise<City[]> {
  return request<City[]>('/geo/cities');
}

async function realCompleteProfile(
  dto: CompleteProfileRequest,
): Promise<CompleteProfileResponse> {
  return request<CompleteProfileResponse>('/auth/register/complete', {
    method: 'POST',
    body: dto,
  });
}

export const registerApi = {
  startRegister(dto: StartRegisterRequest): Promise<StartRegisterResponse> {
    if (USE_MOCK) {
      return mockStartRegister(dto);
    }

    return realStartRegister(dto);
  },

  verifyCode(dto: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    if (USE_MOCK) {
      return mockVerifyCode(dto);
    }

    return realVerifyCode(dto);
  },

  getCities(): Promise<City[]> {
    if (USE_MOCK) {
      return mockGetCities();
    }

    return realGetCities();
  },

  completeProfile(dto: CompleteProfileRequest): Promise<CompleteProfileResponse> {
    if (USE_MOCK) {
      return mockCompleteProfile(dto);
    }

    return realCompleteProfile(dto);
  },
};