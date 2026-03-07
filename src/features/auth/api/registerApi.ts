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
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockStartRegister(dto: StartRegisterRequest): Promise<StartRegisterResponse> {
  await delay(500);
  mockDb.email = dto.email;

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

  return mockDb.cities;
}

async function mockCompleteProfile(dto: CompleteProfileRequest): Promise<CompleteProfileResponse> {
  await delay(500);

  const firstName = dto.firstName.trim();
  const lastName = dto.lastName.trim();
  const fullName = `${firstName} ${lastName}.trim()`;

  return {
    accessToken: 'mock-access-token',
    user: {
      id: 'u1',
      email: mockDb.email || 'mock@tailly.ru',
      name: fullName || 'Mock User',
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: undefined,
      cityId: dto.cityId,
    },
  };
}

export const registerApi = {
  startRegister: (dto: StartRegisterRequest) => {
    if (USE_MOCK) {
      return mockStartRegister(dto);
    }

    return request('/auth/register/start', {
      method: 'POST',
      body: dto,
    });
  },

  verifyCode: (dto: VerifyCodeRequest) => {
    if (USE_MOCK) {
      return mockVerifyCode(dto);
    }

    return request('/auth/register/verify', {
      method: 'POST',
      body: dto,
    });
  },

  getCities: () => {
    if (USE_MOCK) {
      return mockGetCities();
    }

    return request('/geo/cities');
  },

  completeProfile: (dto: CompleteProfileRequest) => {
    if (USE_MOCK) {
      return mockCompleteProfile(dto);
    }

    return request('/auth/register/complete', {
      method: 'POST',
      body: dto,
    });
  },
};