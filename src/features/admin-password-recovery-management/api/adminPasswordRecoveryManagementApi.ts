// src/features/admin-password-recovery-management/api/adminPasswordRecoveryManagementApi.ts
import { request } from '@/shared/api/http';

import {
  mockGetAdminPasswordRecoveryRequests,
  mockProcessAdminPasswordRecoveryRequest,
} from './adminPasswordRecoveryManagementApi.mock';
import type {
  AdminPasswordRecoveryRequestItem,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
    if (USE_MOCK) {
      return mockGetAdminPasswordRecoveryRequests();
    }

    return realGetAdminPasswordRecoveryRequests();
  },

  async processRequest(
    payload: ProcessAdminPasswordRecoveryPayload,
  ): Promise<ProcessAdminPasswordRecoveryResponse> {
    if (USE_MOCK) {
      return mockProcessAdminPasswordRecoveryRequest(payload);
    }

    return realProcessAdminPasswordRecoveryRequest(payload);
  },
};