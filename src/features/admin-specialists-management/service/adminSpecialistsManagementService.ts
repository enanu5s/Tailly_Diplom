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

    const attached = await specialistApplicationsService.attachCreatedSpecialistAccount({
      applicationId: payload.applicationId,
      reviewedBy: payload.reviewedBy,
    });

    const specialistId = attached.createdSpecialistId ?? '';

    return {
      account: {
        id: specialistId,
        email: payload.email,
        role: 'specialist',
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleName: payload.middleName,
        phone: payload.phone,
        city: payload.city,
        about: payload.about,
        specialistId,
        specialistSlug: attached.createdSpecialistSlug ?? undefined,
        applicationId: payload.applicationId,
        createdAt: new Date().toISOString(),
        createdBy: payload.reviewedBy,
        isBlocked: false,
      },
    };
  },
};
