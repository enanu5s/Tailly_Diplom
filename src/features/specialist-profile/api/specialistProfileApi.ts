// src/features/specialist-profile/api/specialistProfileApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockGetSpecialistProfileBySlug,
  mockUpdateCalendar,
  mockUpdateDetails,
  mockUpdateMainInfo,
  mockUpsertReviewReply,
} from './specialistProfileApi.mock';

import type {
  SpecialistCalendarUpdatePayload,
  SpecialistDetailsUpdatePayload,
  SpecialistMainInfoUpdatePayload,
  SpecialistProfileResponse,
  SpecialistReviewReplyUpsertPayload,
} from '../model/types';

async function realGetSpecialistProfileBySlug(
  slug: string,
): Promise<SpecialistProfileResponse> {
  return request<SpecialistProfileResponse>(`/specialists/${encodeURIComponent(slug)}`);
}

async function realUpdateMainInfo(
  slug: string,
  payload: SpecialistMainInfoUpdatePayload,
): Promise<SpecialistProfileResponse> {
  return request<SpecialistProfileResponse>(
    `/specialists/${encodeURIComponent(slug)}/main`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

async function realUpdateDetails(
  slug: string,
  payload: SpecialistDetailsUpdatePayload,
): Promise<SpecialistProfileResponse> {
  return request<SpecialistProfileResponse>(
    `/specialists/${encodeURIComponent(slug)}/details`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

async function realUpdateCalendar(
  slug: string,
  payload: SpecialistCalendarUpdatePayload,
): Promise<SpecialistProfileResponse> {
  return request<SpecialistProfileResponse>(
    `/specialists/${encodeURIComponent(slug)}/calendar`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

async function realUpsertReviewReply(
  slug: string,
  payload: SpecialistReviewReplyUpsertPayload,
): Promise<SpecialistProfileResponse> {
  return request<SpecialistProfileResponse>(
    `/specialists/${encodeURIComponent(slug)}/reviews/${encodeURIComponent(
      payload.reviewId,
    )}/reply`,
    {
      method: 'PUT',
      body: { text: payload.text },
    },
  );
}

export const specialistProfileApi = {
  getBySlug(slug: string): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockGetSpecialistProfileBySlug(slug);
    }

    return realGetSpecialistProfileBySlug(slug);
  },

  updateMainInfo(
    slug: string,
    payload: SpecialistMainInfoUpdatePayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpdateMainInfo(slug, payload);
    }

    return realUpdateMainInfo(slug, payload);
  },

  updateDetails(
    slug: string,
    payload: SpecialistDetailsUpdatePayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpdateDetails(slug, payload);
    }

    return realUpdateDetails(slug, payload);
  },

  updateCalendar(
    slug: string,
    payload: SpecialistCalendarUpdatePayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpdateCalendar(slug, payload);
    }

    return realUpdateCalendar(slug, payload);
  },

  upsertReviewReply(
    slug: string,
    payload: SpecialistReviewReplyUpsertPayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpsertReviewReply(slug, payload);
    }

    return realUpsertReviewReply(slug, payload);
  },
};
