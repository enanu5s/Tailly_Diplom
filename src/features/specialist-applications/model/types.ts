// src/features/specialist-applications/model/types.ts

export type SpecialistApplicationStatus =
    | 'pending_review'
    | 'interview_assigned'
    | 'approved'
    | 'rejected';

export type SpecialistApplication = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    about: string;
    status: SpecialistApplicationStatus;
    createdAt: string;
    updatedAt: string;
    interviewDate?: string | null;
    reviewComment?: string | null;
    reviewedBy?: string | null;
    createdSpecialistId?: string | null;
    createdSpecialistSlug?: string | null;
    specialistAccountCreatedAt?: string | null;
};

export type CreateSpecialistApplicationPayload = {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    about: string;
};

export type AssignInterviewPayload = {
    applicationId: string;
    interviewDate: string;
    reviewComment?: string;
    reviewedBy: string;
};

export type RejectSpecialistApplicationPayload = {
    applicationId: string;
    reviewComment: string;
    reviewedBy: string;
};

export type ApproveSpecialistApplicationPayload = {
    applicationId: string;
    reviewComment?: string;
    reviewedBy: string;
};

export type AttachCreatedSpecialistAccountPayload = {
    applicationId: string;
    specialistId: string;
    specialistSlug?: string;
    reviewedBy: string;
};

export class SpecialistApplicationsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SpecialistApplicationsError';
    }
}