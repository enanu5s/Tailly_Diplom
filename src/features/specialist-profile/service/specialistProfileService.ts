// src/features/specialist-profile/service/specialistProfileService.ts

import { authStore } from '@/features/auth/model/authStore';

import { specialistProfileApi } from '../api/specialistProfileApi';
import type {
    SpecialistDetailsUpdatePayload,
    SpecialistMainInfoUpdatePayload,
    SpecialistProfile,
    SpecialistProfileResponse,
} from '../model/types';

function mapProfile(response: SpecialistProfileResponse): SpecialistProfile {
    const authState = authStore.getState();
    const user = authState.user;

    const isOwner =
        Boolean(authState.token) &&
        user?.role === 'specialist' &&
        user.specialistSlug === response.slug;

    return {
        ...response,
        isOwner,
    };
}

export const specialistProfileService = {
    async getBySlug(slug: string): Promise<SpecialistProfile> {
        const response = await specialistProfileApi.getBySlug(slug);

        return mapProfile(response);
    },

    async updateMainInfo(
        slug: string,
        payload: SpecialistMainInfoUpdatePayload,
    ): Promise<SpecialistProfile> {
        const response = await specialistProfileApi.updateMainInfo(slug, payload);

        return mapProfile(response);
    },

    async updateDetails(
        slug: string,
        payload: SpecialistDetailsUpdatePayload,
    ): Promise<SpecialistProfile> {
        const response = await specialistProfileApi.updateDetails(slug, payload);

        return mapProfile(response);
    },
};