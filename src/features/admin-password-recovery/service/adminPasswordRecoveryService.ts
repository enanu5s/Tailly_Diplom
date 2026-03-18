// src/features/admin-password-recovery/service/adminPasswordRecoveryService.ts
import { adminPasswordRecoveryApi } from '../api/adminPasswordRecoveryApi';

import type {
  AdminPasswordRecoveryRequest,
  AdminPasswordRecoveryResponse,
} from '../model/types';

export const adminPasswordRecoveryService = {
  send(
    payload: AdminPasswordRecoveryRequest,
  ): Promise<AdminPasswordRecoveryResponse> {
    return adminPasswordRecoveryApi.send(payload);
  },
};