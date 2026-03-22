// src/features/specialist-applications/model/types.ts

export type SpecialistApplicationStatus =
  | 'pending_review'
  | 'interview_assigned'
  | 'approved'
  | 'rejected';

export type SpecialistApplicationQuestionnaire = {
  experienceYears: string;
  animalTypes: string[];
  serviceFormats: string[];
  canGiveMedication: boolean;
  canHandleDifficultBehavior: boolean;
  canTakeOvernightOrders: boolean;
  hasOwnPets: boolean;
  hasPetFirstAidBasics: boolean;
  housingType: string;
  districtPreferences: string;
  schedulePreferences: string;
  portfolioUrl: string;
  motivation: string;
  additionalInfo: string;
};

export function createEmptySpecialistApplicationQuestionnaire(): SpecialistApplicationQuestionnaire {
  return {
    experienceYears: '',
    animalTypes: [],
    serviceFormats: [],
    canGiveMedication: false,
    canHandleDifficultBehavior: false,
    canTakeOvernightOrders: false,
    hasOwnPets: false,
    hasPetFirstAidBasics: false,
    housingType: '',
    districtPreferences: '',
    schedulePreferences: '',
    portfolioUrl: '',
    motivation: '',
    additionalInfo: '',
  };
}

export type SpecialistApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  about: string;
  questionnaire?: SpecialistApplicationQuestionnaire | null;
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
  questionnaire: SpecialistApplicationQuestionnaire;
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