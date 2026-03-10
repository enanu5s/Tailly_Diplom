// src/features/specialist-profile/service/specialistProfileService.ts

import { authStore } from '@/features/auth/model/authStore';

import { specialistProfileApi } from '../api/specialistProfileApi';
import type {
    SpecialistCalendarUpdatePayload,
    SpecialistDetailsUpdatePayload,
    SpecialistMainInfoUpdatePayload,
    SpecialistProfile,
    SpecialistProfileResponse,
    SpecialistReviewReplyUpsertPayload,
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
};
