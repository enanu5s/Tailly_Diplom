// src/features/specialist-profile/service/specialistProfileService.ts

import { specialistProfileApi } from '../api/specialistProfileApi';
import type {
    SpecialistCalendarUpdatePayload,
    SpecialistDetailsUpdatePayload,
    SpecialistProfile,
    SpecialistProfileResponse,
    SpecialistMainInfoUpdatePayload,
} from '../model/types';

function mapProfileResponseToProfile(
    response: SpecialistProfileResponse,
): SpecialistProfile {
    return {
        ...response,
        isOwner: true,
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
};