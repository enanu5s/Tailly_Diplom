// src/features/admin-password-recovery-management/service/adminPasswordRecoveryManagementService.ts
import { adminPasswordRecoveryManagementApi } from '../api/adminPasswordRecoveryManagementApi';

import type {
  AdminPasswordRecoveryRequestItem,
  GetAdminPasswordRecoveryRequestsPayload,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

export const adminPasswordRecoveryManagementService = {
  getRequests(
    payload?: GetAdminPasswordRecoveryRequestsPayload,
  ): Promise<AdminPasswordRecoveryRequestItem[]> {
    return adminPasswordRecoveryManagementApi.getRequests(payload);
  },

  processRequest(
    payload: ProcessAdminPasswordRecoveryPayload,
  ): Promise<ProcessAdminPasswordRecoveryResponse> {
    return adminPasswordRecoveryManagementApi.processRequest(payload);
  },
};
