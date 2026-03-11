// src/features/admin-auth/service/adminAuthService.ts

import { adminAuthApi } from '../api/adminAuthApi';
import type { AdminLoginPayload, AdminLoginSuccessResponse } from '../model/types';

export const adminAuthService = {
    login(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
        return adminAuthApi.login(payload);
    },
};