// src/features/admin-password-recovery-management/api/adminPasswordRecoveryManagementApi.ts
import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockGetAdminPasswordRecoveryRequests,
  mockProcessAdminPasswordRecoveryRequest,
} from './adminPasswordRecoveryManagementApi.mock';

import type {
  AdminPasswordRecoveryRequestItem,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

async function realGetAdminPasswordRecoveryRequests(): Promise<
  AdminPasswordRecoveryRequestItem[]
> {
  return request<AdminPasswordRecoveryRequestItem[]>(
    '/super-admin/password-recovery-requests',
  );
}

async function realProcessAdminPasswordRecoveryRequest(
  payload: ProcessAdminPasswordRecoveryPayload,
): Promise<ProcessAdminPasswordRecoveryResponse> {
  return request<ProcessAdminPasswordRecoveryResponse>(
    `/super-admin/password-recovery-requests/${encodeURIComponent(payload.requestId)}/process`,
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
