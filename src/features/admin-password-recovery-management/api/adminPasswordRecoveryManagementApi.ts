// src/features/admin-password-recovery-management/api/adminPasswordRecoveryManagementApi.ts
import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockGetAdminPasswordRecoveryRequests,
  mockGetAdminPasswordRecoveryRequestsByRange,
  mockProcessAdminPasswordRecoveryRequest,
} from './adminPasswordRecoveryManagementApi.mock';

import type {
  AdminPasswordRecoveryRequestItem,
  GetAdminPasswordRecoveryRequestsPayload,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

async function realGetAdminPasswordRecoveryRequests(
  payload?: GetAdminPasswordRecoveryRequestsPayload,
): Promise<
  AdminPasswordRecoveryRequestItem[]
> {
  const params = new URLSearchParams();

  if (payload?.processedFrom) {
    params.set('processedFrom', payload.processedFrom);
  }

  if (payload?.processedTo) {
    params.set('processedTo', payload.processedTo);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return request<AdminPasswordRecoveryRequestItem[]>(
    `/super-admin/password-recovery-requests${suffix}`,
  );
}

async function realProcessAdminPasswordRecoveryRequest(
  payload: ProcessAdminPasswordRecoveryPayload,
): Promise<ProcessAdminPasswordRecoveryResponse> {
  return request<ProcessAdminPasswordRecoveryResponse>(
    `/super-admin/password-recovery-requests/${encodeURIComponent(payload.requestId)}/process`,
    {
      method: 'POST',
      body: {
        requestId: payload.requestId,
      },
    },
  );
}

export const adminPasswordRecoveryManagementApi = {
  async getRequests(
    payload?: GetAdminPasswordRecoveryRequestsPayload,
  ): Promise<AdminPasswordRecoveryRequestItem[]> {
    if (isMockApiMode) {
      return payload
        ? mockGetAdminPasswordRecoveryRequestsByRange(payload)
        : mockGetAdminPasswordRecoveryRequests();
    }

    return realGetAdminPasswordRecoveryRequests(payload);
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
