// src/features/auth/api/registerApi.mock.ts

import { persistMockDatabase } from '@/shared/mock-db/store';

import { cloneCities, getMockRegisterState, wait } from '../data/mockRegister';

import type {
  City,
  CompleteProfileRequest,
  CompleteProfileResponse,
  StartRegisterRequest,
  StartRegisterResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './registerApi';


export async function mockStartRegister(
  dto: StartRegisterRequest,
): Promise<StartRegisterResponse> {
  await wait(500);

  const state = getMockRegisterState();
  state.email = dto.email.trim().toLowerCase();
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

  if (dto.code !== state.lastCode) {
    throw new Error('Неверный код (мок).\nПопробуй 123456');
  }

  return {
    verificationToken: state.verificationToken,
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

  const firstName = dto.firstName.trim();
  const lastName = dto.lastName.trim();
  const middleName = dto.middleName?.trim() ?? '';
  const fullName = [lastName, firstName, middleName].filter(Boolean).join(' ').trim();

  return {
    accessToken: 'mock-access-token-client',
    user: {
      id: 'user-client-registered',
      email: state.email || 'client@tailly.ru',
      role: 'client',
      name: fullName || 'Новый пользователь',
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      middleName: middleName || undefined,
      cityId: dto.cityId,
    },
  };
}