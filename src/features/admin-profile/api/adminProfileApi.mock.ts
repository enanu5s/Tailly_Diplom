// src/features/admin-profile/api/adminProfileApi.mock.ts
import {
  clearPendingSuperAdminEmailChange,
  getMockAdminProfile,
  mockClearPasswordAttemptsLockForCurrentAdmin,
  mockConfirmSuperAdminEmailChange,
  mockRequestSuperAdminEmailChange,
  updateMockAdminProfile,
  wait,
} from '../data/mockAdminProfile';

import type {
  AdminProfile,
  ConfirmSuperAdminEmailChangePayload,
  RequestSuperAdminEmailChangePayload,
  RequestSuperAdminEmailChangeResponse,
  UpdateAdminProfilePayload,
} from '../model/types';

export async function mockGetAdminProfile(): Promise<AdminProfile> {
  await wait();

  return getMockAdminProfile();
}

export async function mockUpdateAdminProfile(
  payload: UpdateAdminProfilePayload,
): Promise<AdminProfile> {
  await wait();

  return updateMockAdminProfile(payload);
}

export async function mockRequestSuperAdminEmailChangeApi(
  payload: RequestSuperAdminEmailChangePayload,
): Promise<RequestSuperAdminEmailChangeResponse> {
  await wait();

  return mockRequestSuperAdminEmailChange(payload);
}

export async function mockConfirmSuperAdminEmailChangeApi(
  payload: ConfirmSuperAdminEmailChangePayload,
): Promise<AdminProfile> {
  await wait();

  return mockConfirmSuperAdminEmailChange(payload);
}

export async function mockCancelSuperAdminEmailChangeApi(): Promise<void> {
  await wait(0);
  clearPendingSuperAdminEmailChange();
}

export async function mockClearPasswordAttemptsLockApi(): Promise<AdminProfile> {
  return mockClearPasswordAttemptsLockForCurrentAdmin();
}
