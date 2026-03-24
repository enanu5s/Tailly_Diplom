// src/features/admin-password-recovery-management/api/adminPasswordRecoveryManagementApi.ts
import { request } from '@/shared/api/http';
import { getOptionalApiBaseUrl, isMockApiMode } from '@/shared/config/env';

import {
  mockGetAdminPasswordRecoveryRequests,
  mockProcessAdminPasswordRecoveryRequest,
} from './adminPasswordRecoveryManagementApi.mock';

import type {
  AdminPasswordRecoveryRequestItem,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

const API_BASE_URL = getOptionalApiBaseUrl();

async function realGetAdminPasswordRecoveryRequests(): Promise<
  AdminPasswordRecoveryRequestItem[]
> {
  return request<AdminPasswordRecoveryRequestItem[]>(
    `${API_BASE_URL}/super-admin/password-recovery-requests`,
  );
}

async function realProcessAdminPasswordRecoveryRequest(
  payload: ProcessAdminPasswordRecoveryPayload,
): Promise<ProcessAdminPasswordRecoveryResponse> {
  return request<ProcessAdminPasswordRecoveryResponse>(
    `${API_BASE_URL}/super-admin/password-recovery-requests/${payload.requestId}/process`,
    {
      method: 'POST',
    },
  );
}

export const adminPasswordRecoveryManagementApi = {
  async getRequests(): Promise<AdminPasswordRecoveryRequestItem[]> {
    if (isMockApiMode) {
      return mockGetAdminPasswordRecoveryRequests();
    }

    return realGetAdminPasswordRecoveryRequests();
  },

  async processRequest(
    payload: ProcessAdminPasswordRecoveryPayload,
  ): Promise<ProcessAdminPasswordRecoveryResponse> {
    if (isMockApiMode) {
      return mockProcessAdminPasswordRecoveryRequest(payload);
    }

    return realProcessAdminPasswordRecoveryRequest(payload);
  },
};
