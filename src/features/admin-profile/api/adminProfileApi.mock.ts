// src/features/admin-profile/api/adminProfileApi.mock.ts
import {
  getMockAdminProfile,
  updateMockAdminProfile,
  wait,
} from '../data/mockAdminProfile';
import type {
  AdminProfile,
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