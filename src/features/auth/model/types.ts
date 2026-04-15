// src/features/auth/model/types.ts

import type { AuthUser } from './authStore';

export type LoginPayload = {
  email: string;
  password: string;
  requestedRole: 'client' | 'specialist';
};

export type LoginSuccessResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
  user?: AuthUser;
};

export type LoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOO_MANY_ATTEMPTS'
  | 'ACCOUNT_BLOCKED'
  | 'INVALID_ROLE'
  | 'ACCOUNT_PENDING_DELETION';

export class LoginError extends Error {
  readonly code: LoginErrorCode;
  readonly attemptsLeft?: number;
  readonly lockUntil?: string | null;

  constructor(params: {
    message: string;
    code: LoginErrorCode;
    attemptsLeft?: number;
    lockUntil?: string | null;
  }) {
    super(params.message);
    this.name = 'LoginError';
    this.code = params.code;
    this.attemptsLeft = params.attemptsLeft;
    this.lockUntil = params.lockUntil ?? null;
  }
}

/* =======================
   PASSWORD RECOVERY TYPES
   ======================= */

export type SendRecoveryCodePayload = {
  email: string;
};

export type VerifyRecoveryCodePayload = {
  email: string;
  code: string;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
};

export type PasswordRecoveryStartFlow = 'default' | 'admin';

export type StartPasswordRecoveryPayload = {
  email: string;
};

export type StartPasswordRecoveryResponse = {
  flow: PasswordRecoveryStartFlow;
};

export class PasswordRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordRecoveryError';
  }
}
