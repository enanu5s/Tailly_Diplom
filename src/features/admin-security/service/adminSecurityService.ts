// src/features/admin-security/service/adminSecurityService.ts

import { adminSecurityApi } from '../api/adminSecurityApi';

export const adminSecurityService = {
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    adminSecurityApi.changePassword(payload),
};
