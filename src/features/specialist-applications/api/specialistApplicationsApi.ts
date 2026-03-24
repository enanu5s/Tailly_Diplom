// src/features/specialist-applications/api/specialistApplicationsApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockApproveApplication,
  mockAssignInterview,
  mockAttachCreatedSpecialistAccount,
  mockCreateApplication,
  mockGetApplications,
  mockRejectApplication,
} from './specialistApplicationsApi.mock';

import type {
  ApproveSpecialistApplicationPayload,
  AssignInterviewPayload,
  AttachCreatedSpecialistAccountPayload,
  CreateSpecialistApplicationPayload,
  RejectSpecialistApplicationPayload,
  SpecialistApplication,
} from '../model/types';

async function realCreateApplication(
  payload: CreateSpecialistApplicationPayload,
): Promise<{ ok: true; application: SpecialistApplication }> {
  return request<{ ok: true; application: SpecialistApplication }>(
    '/specialist-applications',
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realGetApplications(): Promise<SpecialistApplication[]> {
  return request<SpecialistApplication[]>('/admin/specialist-applications');
}

async function realAssignInterview(
  payload: AssignInterviewPayload,
): Promise<SpecialistApplication> {
  return request<SpecialistApplication>(
    `/admin/specialist-applications/${payload.applicationId}/assign-interview`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realRejectApplication(
  payload: RejectSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
  return request<SpecialistApplication>(
    `/admin/specialist-applications/${payload.applicationId}/reject`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realApproveApplication(
  payload: ApproveSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
  return request<SpecialistApplication>(
    `/admin/specialist-applications/${payload.applicationId}/approve`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realAttachCreatedSpecialistAccount(
  payload: AttachCreatedSpecialistAccountPayload,
): Promise<SpecialistApplication> {
  return request<SpecialistApplication>(
    `/admin/specialist-applications/${payload.applicationId}/attach-specialist-account`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

export const specialistApplicationsApi = {
  async createApplication(
    payload: CreateSpecialistApplicationPayload,
  ): Promise<{ ok: true; application: SpecialistApplication }> {
    if (isMockApiMode) {
      return mockCreateApplication(payload);
    }

    return realCreateApplication(payload);
  },

  async getApplications(): Promise<SpecialistApplication[]> {
    if (isMockApiMode) {
      return mockGetApplications();
    }

    return realGetApplications();
  },

  async assignInterview(payload: AssignInterviewPayload): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockAssignInterview(payload);
    }

    return realAssignInterview(payload);
  },

  async rejectApplication(
    payload: RejectSpecialistApplicationPayload,
  ): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockRejectApplication(payload);
    }

    return realRejectApplication(payload);
  },

  async approveApplication(
    payload: ApproveSpecialistApplicationPayload,
  ): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockApproveApplication(payload);
    }

    return realApproveApplication(payload);
  },

  async attachCreatedSpecialistAccount(
    payload: AttachCreatedSpecialistAccountPayload,
  ): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockAttachCreatedSpecialistAccount(payload);
    }

    return realAttachCreatedSpecialistAccount(payload);
  },
};
