// src/features/auth/api/registerApi.ts

import { request } from '@/shared/api/http';

import type { AuthUser } from '../model/authStore';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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

const mockDb: {
  lastCode: string;
  registrationId: string;
  verificationToken: string;
  email: string;
  cities: City[];
} = {
  lastCode: '123456',
  registrationId: 'reg_1',
  verificationToken: 'verif_1',
  email: '',
  cities: [
    { id: 'msk', name: 'Москва' },
    { id: 'spb', name: 'Санкт-Петербург' },
    { id: 'kzn', name: 'Казань' },
    { id: 'ekb', name: 'Екатеринбург' },
  ],
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function mockStartRegister(dto: StartRegisterRequest): Promise<StartRegisterResponse> {
  await delay(500);
  mockDb.email = dto.email.trim().toLowerCase();

  return {
    registrationId: mockDb.registrationId,
  };
}

async function mockVerifyCode(dto: VerifyCodeRequest): Promise<VerifyCodeResponse> {
  await delay(400);

  if (dto.code !== mockDb.lastCode) {
    throw new Error('Неверный код (мок).\nПопробуй 123456');
  }

  return {
    verificationToken: mockDb.verificationToken,
  };
}

async function mockGetCities(): Promise<City[]> {
  await delay(300);

  return JSON.parse(JSON.stringify(mockDb.cities)) as City[];
}

async function mockCompleteProfile(
  dto: CompleteProfileRequest,
): Promise<CompleteProfileResponse> {
  await delay(500);

  const firstName = dto.firstName.trim();
  const lastName = dto.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    accessToken: 'mock-access-token-client',
    user: {
      id: 'user-client-registered',
      email: mockDb.email || 'client@tailly.ru',
      role: 'client',
      name: fullName || 'Новый пользователь',
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      cityId: dto.cityId,
    },
  };
}

async function realStartRegister(dto: StartRegisterRequest): Promise<StartRegisterResponse> {
  return request<StartRegisterResponse>(`${API_BASE_URL} / auth / register / start`, {
    method: 'POST',
    body: dto,
  });
}

async function realVerifyCode(dto: VerifyCodeRequest): Promise<VerifyCodeResponse> {
  return request<VerifyCodeResponse>(`${API_BASE_URL} / auth / register / verify`, {
    method: 'POST',
    body: dto,
  });
}

async function realGetCities(): Promise<City[]> {
  return request<City[]>(`${API_BASE_URL} / geo / cities`);
}

async function realCompleteProfile(
  dto: CompleteProfileRequest,
): Promise<CompleteProfileResponse> {
  return request<CompleteProfileResponse>(`${API_BASE_URL} / auth / register / complete`, {
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