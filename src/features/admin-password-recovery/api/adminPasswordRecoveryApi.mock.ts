// src/features/admin-password-recovery/api/adminPasswordRecoveryApi.mock.ts
import {
  sendRecoveryRequest,
  wait,
} from '../data/mockAdminPasswordRecovery';

import type {
  AdminPasswordRecoveryRequest,
  AdminPasswordRecoveryResponse,
} from '../model/types';

export async function mockAdminPasswordRecovery(
  payload: AdminPasswordRecoveryRequest,
): Promise<AdminPasswordRecoveryResponse> {
  await wait();

  sendRecoveryRequest(payload.email);

  return { success: true };
}