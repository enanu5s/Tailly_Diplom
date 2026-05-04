//src/features/admin-specialists-management/api/adminSpecialistsManagementApi.ts
import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import { mockCreateSpecialistAccount } from './adminSpecialistsManagementApi.mock';
import {
  type CreateSpecialistAccountPayload,
  type CreateSpecialistAccountResponse,
} from '../model/types';

async function realCreateSpecialistAccount(
  payload: CreateSpecialistAccountPayload,
): Promise<CreateSpecialistAccountResponse> {
  return request<CreateSpecialistAccountResponse>(
    `/admin/specialist-applications/${payload.applicationId}/create-specialist-account`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

export const adminSpecialistsManagementApi = {
  async createSpecialistAccount(
    payload: CreateSpecialistAccountPayload,
  ): Promise<CreateSpecialistAccountResponse> {
    if (isMockApiMode) {
      return mockCreateSpecialistAccount(payload);
    }

    return realCreateSpecialistAccount(payload);
  },
};
