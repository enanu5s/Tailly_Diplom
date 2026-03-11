// src/features/auth/model/types.ts

import type { AuthUser } from './authStore';

export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginSuccessResponse = {
    accessToken: string;
    user: AuthUser;
};

export type LoginErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'TOO_MANY_ATTEMPTS'
    | 'ACCOUNT_BLOCKED';

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