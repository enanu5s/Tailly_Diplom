// src/features/admin-auth/model/types.ts

import type { AuthUser } from '@/features/auth/model/authStore';

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminLoginSuccessResponse = {
  accessToken: string;
  user: AuthUser;
};

export type AdminLoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOO_MANY_ATTEMPTS'
  | 'ACCOUNT_BLOCKED';

export class AdminLoginError extends Error {
  readonly code: AdminLoginErrorCode;
  readonly attemptsLeft?: number;
  readonly lockUntil?: string | null;

  constructor(params: {
    message: string;
    code: AdminLoginErrorCode;
    attemptsLeft?: number;
    lockUntil?: string | null;
  }) {
    super(params.message);
    this.name = 'AdminLoginError';
    this.code = params.code;
    this.attemptsLeft = params.attemptsLeft;
    this.lockUntil = params.lockUntil ?? null;
  }
}
