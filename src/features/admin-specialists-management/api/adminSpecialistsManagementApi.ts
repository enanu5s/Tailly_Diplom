//src/features/admin-specialists-management/api/adminSpecialistsManagementApi.ts
import { request } from '@/shared/api/http';

import { mockCreateSpecialistAccount } from './adminSpecialistsManagementApi.mock';
import {
  type CreateSpecialistAccountPayload,
  type CreateSpecialistAccountResponse,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

async function realCreateSpecialistAccount(
  payload: CreateSpecialistAccountPayload,
): Promise<CreateSpecialistAccountResponse> {
  return request<CreateSpecialistAccountResponse>('/admin/specialists', {
    method: 'POST',
    body: payload,
  });
}

export const adminSpecialistsManagementApi = {
  async createSpecialistAccount(
    payload: CreateSpecialistAccountPayload,
  ): Promise<CreateSpecialistAccountResponse> {
    if (USE_MOCK) {
      return mockCreateSpecialistAccount(payload);
    }

    return realCreateSpecialistAccount(payload);
  },
};