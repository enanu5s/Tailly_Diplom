// src/features/auth/api/registerApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockCompleteProfile,
  mockGetCities,
  mockStartRegister,
  mockVerifyCode,
} from './registerApi.mock';

import type { AuthUser } from '../model/authStore';

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
  middleName?: string;
  cityId: string;
  cityName?: string;
};

export type CompleteProfileResponse = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpires?: string;
  refreshTokenExpires?: string;
  user?: AuthUser & {
    cityId?: string;
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

async function realVerifyCode(dto: VerifyCodeRequest): Promise<VerifyCodeResponse> {
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
    if (isMockApiMode) {
      return mockStartRegister(dto);
    }

    return realStartRegister(dto);
  },

  verifyCode(dto: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    if (isMockApiMode) {
      return mockVerifyCode(dto);
    }

    return realVerifyCode(dto);
  },

  getCities(): Promise<City[]> {
    if (isMockApiMode) {
      return mockGetCities();
    }

    return realGetCities();
  },

  completeProfile(dto: CompleteProfileRequest): Promise<CompleteProfileResponse> {
    if (isMockApiMode) {
      return mockCompleteProfile(dto);
    }

    return realCompleteProfile(dto);
  },
};