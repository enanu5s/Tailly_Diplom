// /src/shared/api/specialistApplicationApi.ts
import { createEmptySpecialistApplicationQuestionnaire } from '@/features/specialist-applications/model/types';
import { specialistApplicationsService } from '@/features/specialist-applications/service/specialistApplicationsService';

export type SpecialistApplicationRequest = {
  name: string;
  email: string;
  phone: string;
  city: string;
  about: string;
};

export type SpecialistApplicationResponse = {
  ok: true;
};

export const specialistApplicationApi = {
  async send(dto: SpecialistApplicationRequest): Promise<SpecialistApplicationResponse> {
    await specialistApplicationsService.createApplication({
      fullName: dto.name,
      email: dto.email,
      phone: dto.phone,
      city: dto.city,
      about: dto.about,
      questionnaire: createEmptySpecialistApplicationQuestionnaire(),
    });

    return { ok: true };
  },
};
