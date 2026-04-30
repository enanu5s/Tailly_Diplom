// src/features/admin-specialists-management/service/adminSpecialistsManagementService.ts

import { specialistApplicationsService } from '@/features/specialist-applications';
import { isMockApiMode } from '@/shared/config/env';

import { adminSpecialistsManagementApi } from '../api/adminSpecialistsManagementApi';

import type {
  CreateSpecialistAccountPayload,
  CreateSpecialistAccountResponse,
} from '../model/types';

export const adminSpecialistsManagementService = {
  async createSpecialistAccount(
    payload: CreateSpecialistAccountPayload,
  ): Promise<CreateSpecialistAccountResponse> {
    if (isMockApiMode) {
      return adminSpecialistsManagementApi.createSpecialistAccount(payload);
    }

    const created = await adminSpecialistsManagementApi.createSpecialistAccount(payload);

    const attached = await specialistApplicationsService.attachCreatedSpecialistAccount({
      applicationId: payload.applicationId,
      specialistId: created.account.specialistId,
      specialistSlug: created.account.specialistSlug,
      reviewedBy: payload.reviewedBy,
    });

    return {
      account: {
        ...created.account,
        id: attached.createdSpecialistId ?? created.account.id,
        specialistId: attached.createdSpecialistId ?? created.account.specialistId,
        specialistSlug: attached.createdSpecialistSlug ?? undefined,
      },
      temporaryPassword: created.temporaryPassword,
    };
  },
};
