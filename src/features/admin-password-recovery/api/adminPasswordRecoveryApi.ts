// src/features/admin-password-recovery/api/adminPasswordRecoveryApi.ts
import { request } from '@/shared/api/http';
import { getOptionalApiBaseUrl, isMockApiMode } from '@/shared/config/env';

import { mockAdminPasswordRecovery } from './adminPasswordRecoveryApi.mock';

import type {
  AdminPasswordRecoveryRequest,
  AdminPasswordRecoveryResponse,
} from '../model/types';

const API_BASE_URL = getOptionalApiBaseUrl();

async function realAdminPasswordRecovery(
  payload: AdminPasswordRecoveryRequest,
): Promise<AdminPasswordRecoveryResponse> {
  return request(`${API_BASE_URL}/admin/password-recovery`, {
    method: 'POST',
    body: payload,
  });
}

export const adminPasswordRecoveryApi = {
  async send(
    payload: AdminPasswordRecoveryRequest,
  ): Promise<AdminPasswordRecoveryResponse> {
    if (isMockApiMode) {
      return mockAdminPasswordRecovery(payload);
    }

    return realAdminPasswordRecovery(payload);
  },
};
