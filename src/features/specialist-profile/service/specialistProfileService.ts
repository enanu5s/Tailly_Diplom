// src/features/specialist-profile/service/specialistProfileService.ts

import { specialistProfileApi } from '../api/specialistProfileApi';
import type { SpecialistProfile } from '../model/types';

export const specialistProfileService = {
    getBySlug(slug: string): Promise<SpecialistProfile> {
        return specialistProfileApi.getBySlug(slug);
    },
};