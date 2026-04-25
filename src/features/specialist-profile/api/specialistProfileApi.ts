// src/features/specialist-profile/api/specialistProfileApi.ts

import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';
import { mockDataSourceStore } from '@/shared/lib/mock/mockDataSourceStore';

import {
  mockGetSpecialistProfileById,
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
  SpecialistService,
  SpecialistReviewReplyUpsertPayload,
} from '../model/types';

function buildServiceDescription(service: SpecialistService): string {
  const provided = service.description?.trim();
  if (provided) {
    return provided;
  }

  const name = service.name.trim().toLowerCase();
  const location = service.locationLabel.trim() || 'по согласованию';

  if (name.includes('прогул')) {
    const duration = service.bookingPolicy?.duration.defaultDurationMinutes;
    const durationSuffix =
      typeof duration === 'number' && duration > 0 ? `, длительность ${duration} минут.` : '.';
    return `Прогулка с собакой ${location.toLowerCase()}${durationSuffix}`;
  }

  if (name.includes('передерж')) {
    const minStay = service.bookingPolicy?.multiDay?.minStayDays;
    const maxStay = service.bookingPolicy?.multiDay?.maxStayDays;
    if (typeof minStay === 'number' && typeof maxStay === 'number') {
      return `Передержка осуществляется у специалиста или у клиента. Срок передержки: от ${minStay} до ${maxStay} дней.`;
    }
    return `Передержка осуществляется ${location.toLowerCase()}.`;
  }

  if (name.includes('дрес')) {
    const duration = service.bookingPolicy?.duration.defaultDurationMinutes;
    const durationSuffix =
      typeof duration === 'number' && duration > 0 ? `. Длительность ${duration} минут.` : '.';
    return `Дресировка вашего питомца ${location.toLowerCase()}. Помогу разобраться в поведении вашего любимца${durationSuffix}`;
  }

  return location;
}

function normalizeProfileResponse(
  response: SpecialistProfileResponse,
): SpecialistProfileResponse {
  return {
    ...response,
    services: response.services.map((service) => ({
      ...service,
      description: buildServiceDescription(service),
    })),
  };
}

async function realGetSpecialistProfileBySlug(
  slug: string,
): Promise<SpecialistProfileResponse> {
  return request<SpecialistProfileResponse>(`/specialists/${encodeURIComponent(slug)}`);
}

async function realGetSpecialistProfileById(
  id: string,
): Promise<SpecialistProfileResponse> {
  return request<SpecialistProfileResponse>(`/specialists/${encodeURIComponent(id)}`);
}

async function realUpdateMainInfo(
  slug: string,
  payload: SpecialistMainInfoUpdatePayload,
): Promise<SpecialistProfileResponse> {
  await request<{ success: boolean }>(
    `/specialists/${encodeURIComponent(slug)}/main`,
    {
      method: 'PATCH',
      body: payload,
    },
  );

  return realGetSpecialistProfileBySlug(slug);
}

async function realUpdateDetails(
  slug: string,
  payload: SpecialistDetailsUpdatePayload,
): Promise<SpecialistProfileResponse> {
  await request<{ success: boolean }>(
    `/specialists/${encodeURIComponent(slug)}/details`,
    {
      method: 'PATCH',
      body: payload,
    },
  );

  return realGetSpecialistProfileBySlug(slug);
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

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

export const specialistProfileApi = {
  async getBySlug(slug: string): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('specialists/profile', true);
      return normalizeProfileResponse(await mockGetSpecialistProfileBySlug(slug));
    }

    try {
      const data = await realGetSpecialistProfileBySlug(slug);
      mockDataSourceStore.setSource('specialists/profile', false);
      return normalizeProfileResponse(data);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        mockDataSourceStore.setSource('specialists/profile', true);
        return normalizeProfileResponse(await mockGetSpecialistProfileBySlug(slug));
      }

      throw error;
    }
  },

  async getById(id: string): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('specialists/profile', true);
      return normalizeProfileResponse(await mockGetSpecialistProfileById(id));
    }

    try {
      const data = await realGetSpecialistProfileById(id);
      mockDataSourceStore.setSource('specialists/profile', false);
      return normalizeProfileResponse(data);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        mockDataSourceStore.setSource('specialists/profile', true);
        return normalizeProfileResponse(await mockGetSpecialistProfileById(id));
      }

      throw error;
    }
  },

  updateMainInfo(
    slug: string,
    payload: SpecialistMainInfoUpdatePayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpdateMainInfo(slug, payload).then(normalizeProfileResponse);
    }

    return realUpdateMainInfo(slug, payload)
      .then(normalizeProfileResponse)
      .catch((error) => {
        if (shouldFallbackToMock(error)) {
          return mockUpdateMainInfo(slug, payload).then(normalizeProfileResponse);
        }

        throw error;
      });
  },

  updateDetails(
    slug: string,
    payload: SpecialistDetailsUpdatePayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpdateDetails(slug, payload).then(normalizeProfileResponse);
    }

    return realUpdateDetails(slug, payload)
      .then(normalizeProfileResponse)
      .catch((error) => {
        if (shouldFallbackToMock(error)) {
          return mockUpdateDetails(slug, payload).then(normalizeProfileResponse);
        }

        throw error;
      });
  },

  updateCalendar(
    slug: string,
    payload: SpecialistCalendarUpdatePayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpdateCalendar(slug, payload).then(normalizeProfileResponse);
    }

    return realUpdateCalendar(slug, payload)
      .then(normalizeProfileResponse)
      .catch((error) => {
        if (shouldFallbackToMock(error)) {
          return mockUpdateCalendar(slug, payload).then(normalizeProfileResponse);
        }

        throw error;
      });
  },

  upsertReviewReply(
    slug: string,
    payload: SpecialistReviewReplyUpsertPayload,
  ): Promise<SpecialistProfileResponse> {
    if (isMockApiMode) {
      return mockUpsertReviewReply(slug, payload).then(normalizeProfileResponse);
    }

    return realUpsertReviewReply(slug, payload)
      .then(normalizeProfileResponse)
      .catch((error) => {
        if (shouldFallbackToMock(error)) {
          return mockUpsertReviewReply(slug, payload).then(normalizeProfileResponse);
        }

        throw error;
      });
  },
};
