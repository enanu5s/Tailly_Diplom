// src/features/auth/service/authService.ts

import { authApi } from '../api/authApi';

import type {
    LoginPayload,
    LoginSuccessResponse,
} from '../model/types';

export const authService = {
    login(payload: LoginPayload): Promise<LoginSuccessResponse> {
        return authApi.login(payload);
    },
};