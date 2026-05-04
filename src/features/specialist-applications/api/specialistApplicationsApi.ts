// src/features/specialist-applications/api/specialistApplicationsApi.ts

import { HttpError, request } from '@/shared/api/http';
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

export type CreateSpecialistApplicationResult = {
  id: string;
};

type SpecialistApplicationsListResponse = {
  items: SpecialistApplication[];
  total: number;
  page: number;
  limit: number;
};

type AttachCreatedSpecialistAccountResponse = {
  success: boolean;
  application?: SpecialistApplication;
  specialistId?: string;
  specialistSlug?: string;
};

const SPECIALIST_APPLICATION_STATUSES = [
  'pending_review',
  'interview_assigned',
  'approved',
  'rejected',
] as const;

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

async function realCreateApplication(
  payload: CreateSpecialistApplicationPayload,
): Promise<CreateSpecialistApplicationResult> {
  return request<CreateSpecialistApplicationResult>(
    '/specialist-applications',
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realGetApplicationsByStatus(
  status: (typeof SPECIALIST_APPLICATION_STATUSES)[number],
): Promise<SpecialistApplication[]> {
  const limit = 100;
  let page = 1;
  let allItems: SpecialistApplication[] = [];

  while (true) {
    const response = await request<SpecialistApplicationsListResponse>(
      '/admin/specialist-applications',
      {
        query: {
          status,
          page,
          limit,
        },
      },
    );

    const items = Array.isArray(response.items) ? response.items : [];
    allItems = allItems.concat(items);

    if (items.length < limit || allItems.length >= response.total) {
      break;
    }

    page += 1;
  }

  return allItems;
}

async function realGetApplications(): Promise<SpecialistApplication[]> {
  const chunks = await Promise.all(
    SPECIALIST_APPLICATION_STATUSES.map((status) => realGetApplicationsByStatus(status)),
  );

  const deduped = new Map<string, SpecialistApplication>();
  chunks.flat().forEach((item) => deduped.set(item.id, item));
  return Array.from(deduped.values());
}

async function realGetApplicationById(applicationId: string): Promise<SpecialistApplication> {
  const applications = await realGetApplications();
  const found = applications.find((item) => item.id === applicationId);

  if (!found) {
    throw new Error('Заявка не найдена.');
  }

  return found;
}

async function realAssignInterview(
  payload: AssignInterviewPayload,
): Promise<SpecialistApplication> {
  await request<{ success: boolean }>(
    `/admin/specialist-applications/${payload.applicationId}/assign-interview`,
    {
      method: 'POST',
      body: {
        note: payload.reviewComment,
        interviewDate: payload.interviewDate,
      },
    },
  );

  return realGetApplicationById(payload.applicationId);
}

async function realRejectApplication(
  payload: RejectSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
  await request<{ success: boolean }>(
    `/admin/specialist-applications/${payload.applicationId}/reject`,
    {
      method: 'POST',
      body: {
        reason: payload.reviewComment,
      },
    },
  );

  return realGetApplicationById(payload.applicationId);
}

async function realApproveApplication(
  payload: ApproveSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
  await request<{ success: boolean }>(
    `/admin/specialist-applications/${payload.applicationId}/approve`,
    {
      method: 'POST',
    },
  );

  return realGetApplicationById(payload.applicationId);
}

async function realAttachCreatedSpecialistAccount(
  payload: AttachCreatedSpecialistAccountPayload,
): Promise<SpecialistApplication> {
  const response = await request<AttachCreatedSpecialistAccountResponse>(
    `/admin/specialist-applications/${payload.applicationId}/attach-specialist-account`,
    {
      method: 'POST',
      body: {
        specialistId: payload.specialistId,
        specialistSlug: payload.specialistSlug,
        reviewedBy: payload.reviewedBy,
      },
    },
  );

  const updated = response.application ?? (await realGetApplicationById(payload.applicationId));
  const createdSpecialistId =
    response.specialistId ?? updated.createdSpecialistId ?? payload.specialistId;
  const createdSpecialistSlug =
    response.specialistSlug ?? updated.createdSpecialistSlug ?? payload.specialistSlug ?? null;

  return {
    ...updated,
    createdSpecialistId,
    createdSpecialistSlug,
  };
}

export const specialistApplicationsApi = {
  async createApplication(
    payload: CreateSpecialistApplicationPayload,
  ): Promise<CreateSpecialistApplicationResult> {
    if (isMockApiMode) {
      return mockCreateApplication(payload);
    }

    return realCreateApplication(payload);
  },

  async getApplications(): Promise<SpecialistApplication[]> {
    if (isMockApiMode) {
      return mockGetApplications();
    }

    try {
      return await realGetApplications();
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockGetApplications();
      }

      throw error;
    }
  },

  async assignInterview(payload: AssignInterviewPayload): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockAssignInterview(payload);
    }

    try {
      return await realAssignInterview(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockAssignInterview(payload);
      }

      throw error;
    }
  },

  async rejectApplication(
    payload: RejectSpecialistApplicationPayload,
  ): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockRejectApplication(payload);
    }

    try {
      return await realRejectApplication(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockRejectApplication(payload);
      }

      throw error;
    }
  },

  async approveApplication(
    payload: ApproveSpecialistApplicationPayload,
  ): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockApproveApplication(payload);
    }

    try {
      return await realApproveApplication(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockApproveApplication(payload);
      }

      throw error;
    }
  },

  async attachCreatedSpecialistAccount(
    payload: AttachCreatedSpecialistAccountPayload,
  ): Promise<SpecialistApplication> {
    if (isMockApiMode) {
      return mockAttachCreatedSpecialistAccount(payload);
    }

    try {
      return await realAttachCreatedSpecialistAccount(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockAttachCreatedSpecialistAccount(payload);
      }

      throw error;
    }
  },
};
