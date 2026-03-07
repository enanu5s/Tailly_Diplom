// src/features/auth/api/authApi.ts

import { request } from '@/shared/api/http';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
};

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

function mockLogin(dto: LoginRequest): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (dto.password !== '123456') {
        reject({
          message: 'Неверный пароль (мок).\nПароль: 123456',
        });

        return;
      }

      resolve({
        accessToken: 'mock-token-123',
        user: {
          id: 'u1',
          email: dto.email,
          name: 'Иван Петров',
          firstName: 'Иван',
          lastName: 'Петров',
          phone: '+7 (999) 123-45-67',
        },
      });
    }, 500);
  });
}

export const authApi = {
  login: (dto: LoginRequest) => {
    if (USE_MOCK) {
      return mockLogin(dto);
    }

    return request('/auth/login', {
      method: 'POST',
      body: dto,
    });
  },
};