// src/features/auth/api/authApi.ts

import { request } from '@/shared/api/http';

import type { AuthUser } from '../model/authStore';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type MockLoginUser = {
  email: string;
  password: string;
  accessToken: string;
  user: AuthUser;
};

const MOCK_LOGIN_USERS: MockLoginUser[] = [
  {
    email: 'client@tailly.ru',
    password: '123456',
    accessToken: 'mock-token-client',
    user: {
      id: 'user-client-1',
      email: 'client@tailly.ru',
      role: 'client',
      name: 'Анна Смирнова',
      firstName: 'Анна',
      lastName: 'Смирнова',
      phone: '+7 (999) 111-11-11',
    },
  },
  {
    email: 'specialist@tailly.ru',
    password: '123456',
    accessToken: 'mock-token-specialist',
    user: {
      id: 'user-specialist-1',
      email: 'specialist@tailly.ru',
      role: 'specialist',
      name: 'Мария Иванова',
      firstName: 'Мария',
      lastName: 'Иванова',
      phone: '+7 (999) 123-45-67',
      specialistId: 'specialist-1',
      specialistSlug: 'maria-ivanova',
    },
  },
  {
    email: 'admin@tailly.ru',
    password: '123456',
    accessToken: 'mock-token-admin',
    user: {
      id: 'user-admin-1',
      email: 'admin@tailly.ru',
      role: 'admin',
      name: 'Администратор Tailly',
      firstName: 'Администратор',
      lastName: 'Tailly',
    },
  },
  {
    email: 'superadmin@tailly.ru',
    password: '123456',
    accessToken: 'mock-token-super-admin',
    user: {
      id: 'user-super-admin-1',
      email: 'superadmin@tailly.ru',
      role: 'super_admin',
      name: 'Главный администратор Tailly',
      firstName: 'Главный',
      lastName: 'Администратор',
    },
  },
];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function mockLogin(dto: LoginRequest): Promise<LoginResponse> {
  await delay(500);

  const normalizedEmail = normalizeEmail(dto.email);
  const password = dto.password.trim();

  const matchedUser = MOCK_LOGIN_USERS.find(
    (item) => item.email === normalizedEmail && item.password === password,
  );

  if (matchedUser) {
    return {
      accessToken: matchedUser.accessToken,
      user: JSON.parse(JSON.stringify(matchedUser.user)) as AuthUser,
    };
  }

  if (password !== '123456') {
    throw new Error('Неверный пароль (мок).\nПароль для теста: 123456');
  }

  return {
    accessToken: 'mock-token-client-default',
    user: {
      id: 'user-client-default',
      email: normalizedEmail || 'client@tailly.ru',
      role: 'client',
      name: 'Новый пользователь',
      firstName: 'Новый',
      lastName: 'Пользователь',
    },
  };
}

async function realLogin(dto: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>(`${API_BASE_URL} / auth / login`, {
    method: 'POST',
    body: dto,
  });
}

export const authApi = {
  login(dto: LoginRequest): Promise<LoginResponse> {
    if (USE_MOCK) {
      return mockLogin(dto);
    }

    return realLogin(dto);
  },
};