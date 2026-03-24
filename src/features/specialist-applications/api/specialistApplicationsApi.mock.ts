// src/features/specialist-applications/api/specialistApplicationsApi.mock.ts

import { notifyModerationApplicationStatus } from '@/shared/lib/emailNotifications';

import {
  delay,
  ensureMockSeed,
  generateId,
  normalizeOptional,
  readMockApplications,
  writeMockApplications,
} from '../data/mockSpecialistApplications.ts';
import {
  SpecialistApplicationsError,
  type ApproveSpecialistApplicationPayload,
  type AssignInterviewPayload,
  type AttachCreatedSpecialistAccountPayload,
  type CreateSpecialistApplicationPayload,
  type RejectSpecialistApplicationPayload,
  type SpecialistApplication,
} from '../model/types';

export async function mockCreateApplication(
  payload: CreateSpecialistApplicationPayload,
): Promise<{ ok: true; application: SpecialistApplication }> {
  await delay();
  ensureMockSeed();

  const applications = readMockApplications();
  const nowIso = new Date().toISOString();

  const createdApplication: SpecialistApplication = {
    id: generateId(),
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    city: payload.city.trim(),
    about: payload.about.trim(),
    questionnaire: JSON.parse(
      JSON.stringify(payload.questionnaire),
    ) as CreateSpecialistApplicationPayload['questionnaire'],
    status: 'pending_review',
    createdAt: nowIso,
    updatedAt: nowIso,
    interviewDate: null,
    reviewComment: null,
    reviewedBy: null,
    createdSpecialistId: null,
    createdSpecialistSlug: null,
    specialistAccountCreatedAt: null,
  };

  applications.unshift(createdApplication);
  writeMockApplications(applications);

  notifyModerationApplicationStatus({
    email: createdApplication.email,
    fullName: createdApplication.fullName,
    applicationId: createdApplication.id,
    status: createdApplication.status,
    reviewComment: null,
    interviewDate: null,
  });

  return {
    ok: true,
    application: JSON.parse(JSON.stringify(createdApplication)) as SpecialistApplication,
  };
}

export async function mockGetApplications(): Promise<SpecialistApplication[]> {
  await delay();
  ensureMockSeed();

  const applications = readMockApplications();
  return JSON.parse(JSON.stringify(applications)) as SpecialistApplication[];
}

export async function mockAssignInterview(
  payload: AssignInterviewPayload,
): Promise<SpecialistApplication> {
  await delay();
  ensureMockSeed();

  const applications = readMockApplications();
  const index = applications.findIndex((item) => item.id === payload.applicationId);

  if (index === -1) {
    throw new SpecialistApplicationsError('Заявка не найдена.');
  }

  const updated: SpecialistApplication = {
    ...applications[index],
    status: 'interview_assigned',
    interviewDate: payload.interviewDate,
    reviewComment: normalizeOptional(payload.reviewComment) ?? null,
    reviewedBy: payload.reviewedBy,
    updatedAt: new Date().toISOString(),
  };

  applications[index] = updated;
  writeMockApplications(applications);

  notifyModerationApplicationStatus({
    email: updated.email,
    fullName: updated.fullName,
    applicationId: updated.id,
    status: updated.status,
    reviewComment: updated.reviewComment,
    interviewDate: updated.interviewDate,
  });

  return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}

export async function mockRejectApplication(
  payload: RejectSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
  await delay();
  ensureMockSeed();

  const applications = readMockApplications();
  const index = applications.findIndex((item) => item.id === payload.applicationId);

  if (index === -1) {
    throw new SpecialistApplicationsError('Заявка не найдена.');
  }

  const updated: SpecialistApplication = {
    ...applications[index],
    status: 'rejected',
    reviewComment: normalizeOptional(payload.reviewComment) ?? null,
    reviewedBy: payload.reviewedBy,
    updatedAt: new Date().toISOString(),
  };

  applications[index] = updated;
  writeMockApplications(applications);

  notifyModerationApplicationStatus({
    email: updated.email,
    fullName: updated.fullName,
    applicationId: updated.id,
    status: updated.status,
    reviewComment: updated.reviewComment,
    interviewDate: updated.interviewDate,
  });

  return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}

export async function mockApproveApplication(
  payload: ApproveSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
  await delay();
  ensureMockSeed();

  const applications = readMockApplications();
  const index = applications.findIndex((item) => item.id === payload.applicationId);

  if (index === -1) {
    throw new SpecialistApplicationsError('Заявка не найдена.');
  }

  const updated: SpecialistApplication = {
    ...applications[index],
    status: 'approved',
    reviewComment: normalizeOptional(payload.reviewComment) ?? null,
    reviewedBy: payload.reviewedBy,
    updatedAt: new Date().toISOString(),
  };

  applications[index] = updated;
  writeMockApplications(applications);

  notifyModerationApplicationStatus({
    email: updated.email,
    fullName: updated.fullName,
    applicationId: updated.id,
    status: updated.status,
    reviewComment: updated.reviewComment,
    interviewDate: updated.interviewDate,
  });

  return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}

export async function mockAttachCreatedSpecialistAccount(
  payload: AttachCreatedSpecialistAccountPayload,
): Promise<SpecialistApplication> {
  await delay();
  ensureMockSeed();

  const applications = readMockApplications();
  const index = applications.findIndex((item) => item.id === payload.applicationId);

  if (index === -1) {
    throw new SpecialistApplicationsError('Заявка не найдена.');
  }

  const current = applications[index];

  const updated: SpecialistApplication = {
    ...current,
    status: 'approved',
    reviewedBy: payload.reviewedBy,
    createdSpecialistId: payload.specialistId,
    createdSpecialistSlug: payload.specialistSlug ?? null,
    specialistAccountCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  applications[index] = updated;
  writeMockApplications(applications);

  notifyModerationApplicationStatus({
    email: updated.email,
    fullName: updated.fullName,
    applicationId: updated.id,
    status: updated.status,
    reviewComment: updated.reviewComment,
    interviewDate: updated.interviewDate,
  });

  return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}
