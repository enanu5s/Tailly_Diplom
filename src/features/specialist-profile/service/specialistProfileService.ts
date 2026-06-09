// src/features/specialist-profile/service/specialistProfileService.ts

import { authStore } from '@/features/auth/model/authStore';

import { specialistProfileApi } from '../api/specialistProfileApi';

import type {
  SpecialistCalendarUpdatePayload,
  SpecialistDetailsUpdatePayload,
  SpecialistEmailChangeSendCodePayload,
  SpecialistEmailChangeSendCodeResponse,
  SpecialistEmailChangeVerifyCodePayload,
  SpecialistProfileEditOptionsResponse,
  SpecialistMainInfoUpdatePayload,
  SpecialistProfile,
  SpecialistProfileResponse,
  SpecialistReviewReplyUpsertPayload,
  SpecialistServiceCreatePayload,
  SpecialistServiceEditPayload,
} from '../model/types';

function mapProfileResponseToProfile(
  response: SpecialistProfileResponse,
): SpecialistProfile {
  const { user, token } = authStore.getState();

  const isOwner =
    Boolean(token) &&
    user?.role === 'specialist' &&
    (user.specialistSlug === response.slug || user.specialistId === response.id);

  return {
    ...response,
    isOwner,
  };
}

export const specialistProfileService = {
  async getBySlug(slug: string): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.getBySlug(slug);
    return mapProfileResponseToProfile(response);
  },

  async getById(id: string): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.getById(id);
    return mapProfileResponseToProfile(response);
  },

  async getEditOptions(slug: string): Promise<SpecialistProfileEditOptionsResponse> {
    return specialistProfileApi.getEditOptions(slug);
  },

  async updateMainInfo(
    slug: string,
    payload: SpecialistMainInfoUpdatePayload,
  ): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.updateMainInfo(slug, payload);
    return mapProfileResponseToProfile(response);
  },

  async updateDetails(
    slug: string,
    payload: SpecialistDetailsUpdatePayload,
  ): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.updateDetails(slug, payload);
    return mapProfileResponseToProfile(response);
  },

  async createService(
    slug: string,
    payload: SpecialistServiceCreatePayload,
  ): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.createService(slug, payload);
    return mapProfileResponseToProfile(response);
  },

  async updateService(
    slug: string,
    serviceId: string,
    payload: SpecialistServiceEditPayload,
  ): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.updateService(slug, serviceId, payload);
    return mapProfileResponseToProfile(response);
  },

  async deleteService(slug: string, serviceId: string): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.deleteService(slug, serviceId);
    return mapProfileResponseToProfile(response);
  },

  async updateCalendar(
    slug: string,
    payload: SpecialistCalendarUpdatePayload,
  ): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.updateCalendar(slug, payload);
    return mapProfileResponseToProfile(response);
  },

  async upsertReviewReply(
    slug: string,
    payload: SpecialistReviewReplyUpsertPayload,
  ): Promise<SpecialistProfile> {
    const response = await specialistProfileApi.upsertReviewReply(slug, payload);
    return mapProfileResponseToProfile(response);
  },

  async sendEmailChangeCode(
    slug: string,
    payload: SpecialistEmailChangeSendCodePayload,
  ): Promise<SpecialistEmailChangeSendCodeResponse> {
    return specialistProfileApi.sendEmailChangeCode(slug, payload);
  },

  async verifyEmailChangeCode(
    slug: string,
    payload: SpecialistEmailChangeVerifyCodePayload,
  ): Promise<{
    profile: SpecialistProfile;
    attemptsLeft: number;
    lockUntil: string | null;
  }> {
    const response = await specialistProfileApi.verifyEmailChangeCode(slug, payload);
    return {
      ...response,
      profile: mapProfileResponseToProfile(response.profile),
    };
  },
};
