// src/features/admin-specialists-management/service/adminSpecialistsManagementService.ts

import { adminSpecialistsManagementApi } from '../api/adminSpecialistsManagementApi';

import type {
  CreateSpecialistAccountPayload,
  CreateSpecialistAccountResponse,
} from '../model/types';

export const adminSpecialistsManagementService = {
  async createSpecialistAccount(
    payload: CreateSpecialistAccountPayload,
  ): Promise<CreateSpecialistAccountResponse> {
    return adminSpecialistsManagementApi.createSpecialistAccount(payload);
  },
};
