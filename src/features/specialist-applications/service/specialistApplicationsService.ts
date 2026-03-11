// src/features/specialist-applications/service/specialistApplicationsService.ts

import { specialistApplicationsApi } from '../api/specialistApplicationsApi';
import type {
    ApproveSpecialistApplicationPayload,
    AssignInterviewPayload,
    CreateSpecialistApplicationPayload,
    RejectSpecialistApplicationPayload,
    SpecialistApplication,
} from '../model/types';

export const specialistApplicationsService = {
    createApplication(
        payload: CreateSpecialistApplicationPayload,
    ): Promise<{ ok: true; application: SpecialistApplication }> {
        return specialistApplicationsApi.createApplication(payload);
    },

    getApplications(): Promise<SpecialistApplication[]> {
        return specialistApplicationsApi.getApplications();
    },

    assignInterview(
        payload: AssignInterviewPayload,
    ): Promise<SpecialistApplication> {
        return specialistApplicationsApi.assignInterview(payload);
    },

    rejectApplication(
        payload: RejectSpecialistApplicationPayload,
    ): Promise<SpecialistApplication> {
        return specialistApplicationsApi.rejectApplication(payload);
    },

    approveApplication(
        payload: ApproveSpecialistApplicationPayload,
    ): Promise<SpecialistApplication> {
        return specialistApplicationsApi.approveApplication(payload);
    },
};