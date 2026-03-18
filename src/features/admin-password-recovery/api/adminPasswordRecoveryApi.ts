// src/features/admin-password-recovery/api/adminPasswordRecoveryApi.ts
import { request } from '@/shared/api/http';

import { mockAdminPasswordRecovery } from './adminPasswordRecoveryApi.mock';

import type {
  AdminPasswordRecoveryRequest,
  AdminPasswordRecoveryResponse,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
    if (USE_MOCK) {
      return mockAdminPasswordRecovery(payload);
    }

    return realAdminPasswordRecovery(payload);
  },
};