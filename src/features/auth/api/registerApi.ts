// src/features/auth/api/registerApi.ts
import { request } from '@/shared/api/http';

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
  verificationToken: string; // временный токен на завершение регистрации
};

export type City = { id: string; name: string };

export type CompleteProfileRequest = {
  verificationToken: string;
  firstName: string;
  lastName: string;
  cityId: string;
};

export type CompleteProfileResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    cityId: string;
  };
};

// ---------------- MOCK ----------------
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

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function mockStartRegister(dto: StartRegisterRequest): Promise<StartRegisterResponse> {
  await delay(500);
  // “сохраняем” email, как будто на него отправили письмо
  mockDb.email = dto.email;
  // “отправили код” на почту, код всегда 123456 в мок-режиме
  return { registrationId: mockDb.registrationId };
}

async function mockVerifyCode(dto: VerifyCodeRequest): Promise<VerifyCodeResponse> {
  await delay(400);
  if (dto.code !== mockDb.lastCode) {
    throw new Error('Неверный код (мок). Попробуй 123456');
  }
  return { verificationToken: mockDb.verificationToken };
}

async function mockGetCities(): Promise<City[]> {
  await delay(300);
  return mockDb.cities;
}

async function mockCompleteProfile(dto: CompleteProfileRequest): Promise<CompleteProfileResponse> {
  await delay(500);

  const fullName = `${dto.firstName} ${dto.lastName}`.trim();

  return {
    accessToken: 'mock-access-token',
    user: {
      id: 'u1',
      email: mockDb.email || 'mock@tailly.ru',
      name: fullName || 'Mock User',
      cityId: dto.cityId,
    },
  };
}

// --------------- REAL ---------------
// Когда появится сервер:
// POST /auth/register/start     -> { registrationId }
// POST /auth/register/verify    -> { verificationToken }
// GET  /geo/cities              -> City[]
// POST /auth/register/complete  -> { accessToken, user }

export const registerApi = {
  startRegister: (dto: StartRegisterRequest) => {
    if (USE_MOCK) return mockStartRegister(dto);
    return request<StartRegisterResponse>('/auth/register/start', { method: 'POST', body: dto });
  },

  verifyCode: (dto: VerifyCodeRequest) => {
    if (USE_MOCK) return mockVerifyCode(dto);
    return request<VerifyCodeResponse>('/auth/register/verify', { method: 'POST', body: dto });
  },

  getCities: () => {
    if (USE_MOCK) return mockGetCities();
    return request<City[]>('/geo/cities');
  },

  completeProfile: (dto: CompleteProfileRequest) => {
    if (USE_MOCK) return mockCompleteProfile(dto);
    return request<CompleteProfileResponse>('/auth/register/complete', { method: 'POST', body: dto });
  },
};