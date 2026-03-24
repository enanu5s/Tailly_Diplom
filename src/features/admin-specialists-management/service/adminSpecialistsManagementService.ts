// src/features/admin-specialists-management/service/adminSpecialistsManagementService.ts

import { specialistApplicationsService } from '@/features/specialist-applications';

import { adminSpecialistsManagementApi } from '../api/adminSpecialistsManagementApi';

import type {
  CreateSpecialistAccountPayload,
  CreateSpecialistAccountResponse,
} from '../model/types';

export const adminSpecialistsManagementService = {
  async createSpecialistAccount(
    payload: CreateSpecialistAccountPayload,
  ): Promise<CreateSpecialistAccountResponse> {
    const result = await adminSpecialistsManagementApi.createSpecialistAccount(payload);

    await specialistApplicationsService.attachCreatedSpecialistAccount({
      applicationId: payload.applicationId,
      specialistId: result.account.specialistId,
      specialistSlug: result.account.specialistSlug,
      reviewedBy: payload.reviewedBy,
    });

    return result;
  },
};
