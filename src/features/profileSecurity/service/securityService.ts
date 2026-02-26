//src/features/profileSecurity/service/securityService.ts
import { securityApi } from '../api/securityApi';

export const securityService = {
  requestEmailChangeCode: () => securityApi.requestEmailChangeCode(),
  confirmEmailChange: (payload: { requestId: string; code: string; newEmail: string }) => securityApi.confirmEmailChange(payload),
  changePassword: (payload: { oldPassword: string; newPassword: string }) => securityApi.changePassword(payload),
};