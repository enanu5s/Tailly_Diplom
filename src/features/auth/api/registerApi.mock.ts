// src/features/auth/api/registerApi.mock.ts

import type {
  City,
  CompleteProfileRequest,
  CompleteProfileResponse,
  StartRegisterRequest,
  StartRegisterResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './registerApi';

import { cloneCities, getMockRegisterState, wait } from '../data/mockRegister';

export async function mockStartRegister(
  dto: StartRegisterRequest,
): Promise<StartRegisterResponse> {
  await wait(500);

  const state = getMockRegisterState();
  state.email = dto.email.trim().toLowerCase();

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
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    accessToken: 'mock-access-token-client',
    user: {
      id: 'user-client-registered',
      email: state.email || 'client@tailly.ru',
      role: 'client',
      name: fullName || 'Новый пользователь',
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      cityId: dto.cityId,
    },
  };
}