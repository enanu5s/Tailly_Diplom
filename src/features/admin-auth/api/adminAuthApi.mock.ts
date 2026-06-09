//src/features/admin-auth/api/adminAuthApi.mock.ts

import { mockLogin } from '@/features/auth/api/authApi.mock';
import { LoginError } from '@/features/auth/model/types';

import {
  AdminLoginError,
  type AdminLoginPayload,
  type AdminLoginSuccessResponse,
} from '../model/types';

function mapLoginErrorToAdmin(error: LoginError): AdminLoginError {
  if (error.code === 'TOO_MANY_ATTEMPTS') {
    return new AdminLoginError({
      code: 'TOO_MANY_ATTEMPTS',
      message: error.message,
      attemptsLeft: error.attemptsLeft,
      lockUntil: error.lockUntil,
    });
  }

  if (error.code === 'ACCOUNT_BLOCKED' || error.code === 'ACCOUNT_PENDING_DELETION') {
    return new AdminLoginError({
      code: 'ACCOUNT_BLOCKED',
      message: error.message,
    });
  }

  if (error.code === 'INVALID_ROLE') {
    return new AdminLoginError({
      code: 'INVALID_CREDENTIALS',
      message: 'Учётная запись не найдена или не относится к администраторам.',
    });
  }

  return new AdminLoginError({
    code: 'INVALID_CREDENTIALS',
    message: error.message,
    attemptsLeft: error.attemptsLeft,
    lockUntil: error.lockUntil,
  });
}

export async function mockAdminLogin(
  payload: AdminLoginPayload,
): Promise<AdminLoginSuccessResponse> {
  try {
    return await mockLogin({
      email: payload.email,
      password: payload.password,
      requestedRole: 'client',
    });
  } catch (error) {
    if (error instanceof LoginError) {
      throw mapLoginErrorToAdmin(error);
    }

    throw error;
  }
}
