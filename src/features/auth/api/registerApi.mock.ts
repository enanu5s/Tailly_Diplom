// src/features/auth/api/registerApi.mock.ts

import {
  getMockAuthAccounts,
  mapAccountToLoginSuccess,
  normalizeEmail,
  type MockAuthAccount,
} from '@/features/auth/data/mockAuthAccounts';
import { patchMockDatabase, persistMockDatabase } from '@/shared/mock-db/store';

import { cloneCities, getMockRegisterState, wait } from '../data/mockRegister';

import type { UserProfile } from '@/features/profile/model/types';
import type {
  City,
  CompleteProfileRequest,
  CompleteProfileResponse,
  StartRegisterRequest,
  StartRegisterResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './registerApi';

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function mockStartRegister(
  dto: StartRegisterRequest,
): Promise<StartRegisterResponse> {
  await wait(500);

  const email = normalizeEmail(dto.email);

  if (getMockAuthAccounts().some((a) => normalizeEmail(a.email) === email)) {
    throw new Error('Аккаунт с таким email уже существует');
  }

  const state = getMockRegisterState();
  state.registrationId = newId('reg');
  state.email = email;
  state.password = dto.password;
  state.verificationToken = '';
  persistMockDatabase();

  return {
    registrationId: state.registrationId,
  };
}

export async function mockVerifyCode(
  dto: VerifyCodeRequest,
): Promise<VerifyCodeResponse> {
  await wait(400);

  const state = getMockRegisterState();

  if (dto.registrationId !== state.registrationId) {
    throw new Error('Сессия регистрации устарела. Начните регистрацию заново.');
  }

  if (dto.code !== state.lastCode) {
    throw new Error('Неверный код (мок).\nПопробуй 123456');
  }

  const verificationToken = newId('verif');
  state.verificationToken = verificationToken;
  persistMockDatabase();

  return {
    verificationToken,
  };
}

export async function mockGetCities(): Promise<City[]> {
  await wait(300);
  return cloneCities();
}

export async function mockCompleteProfile(
  dto: CompleteProfileRequest,
): Promise<CompleteProfileResponse> {
  await wait(500);

  const state = getMockRegisterState();

  if (!state.verificationToken || dto.verificationToken !== state.verificationToken) {
    throw new Error('Сессия подтверждения устарела. Пройдите шаг с кодом ещё раз.');
  }

  const password = state.password ?? '';
  const email = state.email || '';

  if (!email.trim() || !password) {
    throw new Error('Сессия регистрации не найдена. Начните с ввода email и пароля.');
  }

  const firstName = dto.firstName.trim();
  const lastName = dto.lastName.trim();
  const middleName = dto.middleName?.trim() ?? '';
  const fullName = [lastName, firstName, middleName].filter(Boolean).join(' ').trim();

  const cityName =
    dto.cityName?.trim() ||
    state.cities.find((c) => c.id === dto.cityId)?.name?.trim() ||
    dto.cityId;

  const newUserId = newId('client');

  const newAccount: MockAuthAccount = {
    id: newUserId,
    email,
    password,
    roles: ['client'],
    firstName: firstName || 'Клиент',
    lastName: lastName || 'Новый',
    middleName: middleName || undefined,
    isBlocked: false,
  };

  const profile: UserProfile = {
    id: newUserId,
    firstName: firstName || 'Клиент',
    lastName: lastName || 'Новый',
    middleName: middleName || undefined,
    city: cityName,
    phone: '',
    email,
  };

  patchMockDatabase((db) => {
    db.auth.baseAccounts.push({ ...newAccount });
    db.client.profiles[newUserId] = profile;
    if (!db.client.petsByUserId[newUserId]) {
      db.client.petsByUserId[newUserId] = [];
    }

    db.register.password = '';
    db.register.verificationToken = '';
    db.register.email = '';
  });

  const login = mapAccountToLoginSuccess(newAccount, 'client');
  const loginUser = login.user ?? {
    id: newUserId,
    email,
    role: 'client' as const,
    name: fullName || undefined,
  };

  return {
    accessToken: login.accessToken,
    refreshToken: login.refreshToken,
    accessTokenExpires: login.accessTokenExpires,
    refreshTokenExpires: login.refreshTokenExpires,
    user: {
      ...loginUser,
      name: fullName || loginUser.name,
      cityId: dto.cityId,
    },
  };
}
