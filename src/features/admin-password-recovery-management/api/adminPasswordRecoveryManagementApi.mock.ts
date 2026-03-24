// src/features/admin-password-recovery-management/api/adminPasswordRecoveryManagementApi.mock.ts
import {
  cloneRecoveryRequests,
  processRecoveryRequest,
  wait,
} from '../data/mockAdminPasswordRecoveryManagement';

import type {
  AdminPasswordRecoveryRequestItem,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

export async function mockGetAdminPasswordRecoveryRequests(): Promise<
  AdminPasswordRecoveryRequestItem[]
> {
  await wait();

  return cloneRecoveryRequests();
}

export async function mockProcessAdminPasswordRecoveryRequest(
  payload: ProcessAdminPasswordRecoveryPayload,
): Promise<ProcessAdminPasswordRecoveryResponse> {
  await wait();

  const request = processRecoveryRequest(payload.requestId);

  return {
    request,
    temporaryPassword: request.temporaryPassword ?? '',
  };
}