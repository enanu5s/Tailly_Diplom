// src/features/admin-password-recovery-management/service/adminPasswordRecoveryManagementService.ts
import { adminPasswordRecoveryManagementApi } from '../api/adminPasswordRecoveryManagementApi';

import type {
  AdminPasswordRecoveryRequestItem,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

export const adminPasswordRecoveryManagementService = {
  getRequests(): Promise<AdminPasswordRecoveryRequestItem[]> {
    return adminPasswordRecoveryManagementApi.getRequests();
  },

  processRequest(
    payload: ProcessAdminPasswordRecoveryPayload,
  ): Promise<ProcessAdminPasswordRecoveryResponse> {
    return adminPasswordRecoveryManagementApi.processRequest(payload);
  },
};
