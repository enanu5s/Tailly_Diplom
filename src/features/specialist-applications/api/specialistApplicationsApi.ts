// src/features/specialist-applications/api/specialistApplicationsApi.ts

import { request } from '@/shared/api/http';

import type {
    ApproveSpecialistApplicationPayload,
    AssignInterviewPayload,
    AttachCreatedSpecialistAccountPayload,
    CreateSpecialistApplicationPayload,
    RejectSpecialistApplicationPayload,
    SpecialistApplication,
} from '../model/types';
import { SpecialistApplicationsError } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const STORAGE_KEY = 'tailly_specialist_applications';

const INITIAL_APPLICATIONS: SpecialistApplication[] = [
    {
        id: 'specialist-application-1',
        fullName: 'Екатерина Морозова',
        email: 'morozova@example.com',
        phone: '+7 (900) 555-12-12',
        city: 'Москва',
        about: 'Уже 4 года ухаживаю за собаками и кошками друзей и знакомых, умею работать с тревожными питомцами.',
        status: 'pending_review',
        createdAt: '2026-03-09T09:15:00.000Z',
        updatedAt: '2026-03-09T09:15:00.000Z',
        interviewDate: null,
        reviewComment: null,
        reviewedBy: null,
        createdSpecialistId: null,
        createdSpecialistSlug: null,
        specialistAccountCreatedAt: null,
    },
    {
        id: 'specialist-application-2',
        fullName: 'Дарья Соколова',
        email: 'sokolova@example.com',
        phone: '+7 (900) 777-00-11',
        city: 'Санкт-Петербург',
        about: 'Работала волонтёром в приюте, умею давать лекарства по расписанию, готова брать заказы на передержку.',
        status: 'interview_assigned',
        createdAt: '2026-03-08T12:00:00.000Z',
        updatedAt: '2026-03-10T10:30:00.000Z',
        interviewDate: '2026-03-14T15:00',
        reviewComment: 'Назначить онлайн-собеседование и уточнить опыт с крупными породами.',
        reviewedBy: 'superadmin@tailly.local',
        createdSpecialistId: null,
        createdSpecialistSlug: null,
        specialistAccountCreatedAt: null,
    },
];

function delay(ms = 350): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function generateId(): string {
    return `specialist-application-${Math.random().toString(36).slice(2, 10)}`;
}

function safeParseApplications(raw: string | null): SpecialistApplication[] {
    if (!raw) {
        return JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)) as SpecialistApplication[];
    }

    try {
        const parsed = JSON.parse(raw) as SpecialistApplication[];

        if (!Array.isArray(parsed)) {
            return JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)) as SpecialistApplication[];
        }

        return parsed;
    } catch {
        return JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)) as SpecialistApplication[];
    }
}

function readMockApplications(): SpecialistApplication[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return safeParseApplications(raw);
}

function writeMockApplications(applications: SpecialistApplication[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function ensureMockSeed(): void {
    const existing = localStorage.getItem(STORAGE_KEY);

    if (!existing) {
        writeMockApplications(
            JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)) as SpecialistApplication[],
        );
    }
}

function normalizeOptional(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

async function mockCreateApplication(
    payload: CreateSpecialistApplicationPayload,
): Promise<{ ok: true; application: SpecialistApplication }> {
    await delay();
    ensureMockSeed();

    const applications = readMockApplications();

    const nowIso = new Date().toISOString();


    const createdApplication: SpecialistApplication = {
        id: generateId(),
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        city: payload.city.trim(),
        about: payload.about.trim(),
        status: 'pending_review',
        createdAt: nowIso,
        updatedAt: nowIso,
        interviewDate: null,
        reviewComment: null,
        reviewedBy: null,
        createdSpecialistId: null,
        createdSpecialistSlug: null,
        specialistAccountCreatedAt: null,
    };

    applications.unshift(createdApplication);
    writeMockApplications(applications);

    return {
        ok: true,
        application: JSON.parse(JSON.stringify(createdApplication)) as SpecialistApplication,
    };
}

async function mockGetApplications(): Promise<SpecialistApplication[]> {
    await delay();
    ensureMockSeed();

    const applications = readMockApplications();

    return JSON.parse(JSON.stringify(applications)) as SpecialistApplication[];
}

async function mockAssignInterview(
    payload: AssignInterviewPayload,
): Promise<SpecialistApplication> {
    await delay();
    ensureMockSeed();

    const applications = readMockApplications();
    const index = applications.findIndex(
        (item) => item.id === payload.applicationId,
    );

    if (index === -1) {
        throw new SpecialistApplicationsError('Заявка не найдена.');
    }

    const current = applications[index];

    const updated: SpecialistApplication = {
        ...current,
        status: 'interview_assigned',
        interviewDate: payload.interviewDate,
        reviewComment: normalizeOptional(payload.reviewComment) ?? null,
        reviewedBy: payload.reviewedBy,
        updatedAt: new Date().toISOString(),
    };

    applications[index] = updated;
    writeMockApplications(applications);

    return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}

async function mockRejectApplication(
    payload: RejectSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
    await delay();
    ensureMockSeed();

    const applications = readMockApplications();
    const index = applications.findIndex(
        (item) => item.id === payload.applicationId,
    );

    if (index === -1) {
        throw new SpecialistApplicationsError('Заявка не найдена.');
    }

    const updated: SpecialistApplication = {
        ...applications[index],
        status: 'rejected',
        interviewDate: null,
        reviewComment: payload.reviewComment.trim(),
        reviewedBy: payload.reviewedBy,
        updatedAt: new Date().toISOString(),
    };

    applications[index] = updated;
    writeMockApplications(applications);

    return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}

async function mockApproveApplication(
    payload: ApproveSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
    await delay();
    ensureMockSeed();

    const applications = readMockApplications();
    const index = applications.findIndex(
        (item) => item.id === payload.applicationId,
    );

    if (index === -1) {
        throw new SpecialistApplicationsError('Заявка не найдена.');
    }

    const updated: SpecialistApplication = {
        ...applications[index],
        status: 'approved',
        reviewComment: normalizeOptional(payload.reviewComment) ?? null,
        reviewedBy: payload.reviewedBy,
        updatedAt: new Date().toISOString(),
    };

    applications[index] = updated;
    writeMockApplications(applications);

    return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}

async function mockAttachCreatedSpecialistAccount(
    payload: AttachCreatedSpecialistAccountPayload,
): Promise<SpecialistApplication> {
    await delay();
    ensureMockSeed();

    const applications = readMockApplications();
    const index = applications.findIndex(
        (item) => item.id === payload.applicationId,
    );

    if (index === -1) {
        throw new SpecialistApplicationsError('Заявка не найдена.');
    }


    const current = applications[index];

    const updated: SpecialistApplication = {
        ...current,
        status: 'approved',
        reviewedBy: payload.reviewedBy,
        createdSpecialistId: payload.specialistId,
        createdSpecialistSlug: payload.specialistSlug ?? null,
        specialistAccountCreatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    applications[index] = updated;
    writeMockApplications(applications);

    return JSON.parse(JSON.stringify(updated)) as SpecialistApplication;
}

async function realCreateApplication(
    payload: CreateSpecialistApplicationPayload,
): Promise<{ ok: true; application: SpecialistApplication }> {
    return request(`${API_BASE_URL}/specialist-applications`, {
        method: 'POST',
        body: payload,
    }) as Promise<{ ok: true; application: SpecialistApplication }>;
}

async function realGetApplications(): Promise<SpecialistApplication[]> {
    return request(`${API_BASE_URL}/admin/specialist-applications`, {
        method: 'GET',
    }) as Promise<SpecialistApplication[]>;
}

async function realAssignInterview(
    payload: AssignInterviewPayload,
): Promise<SpecialistApplication> {
    return request(
        `${API_BASE_URL}/admin/specialist-applications/${payload.applicationId}/assign-interview`,
        {
            method: 'POST',
            body: payload,
        },
    ) as Promise<SpecialistApplication>;
}

async function realRejectApplication(
    payload: RejectSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
    return request(
        `${API_BASE_URL}/admin/specialist-applications/${payload.applicationId}/reject`,
        {
            method: 'POST',
            body: payload,
        },
    ) as Promise<SpecialistApplication>;
}

async function realApproveApplication(
    payload: ApproveSpecialistApplicationPayload,
): Promise<SpecialistApplication> {
    return request(
        `${API_BASE_URL}/admin/specialist-applications/${payload.applicationId}/approve`,
        {
            method: 'POST',
            body: payload,
        },
    ) as Promise<SpecialistApplication>;
}

async function realAttachCreatedSpecialistAccount(
    payload: AttachCreatedSpecialistAccountPayload,
): Promise<SpecialistApplication> {
    return request(
        `${API_BASE_URL}/admin/specialist-applications/${payload.applicationId}/attach-specialist-account`,
        {
            method: 'POST',
            body: payload,
        },
    ) as Promise<SpecialistApplication>;
}

export const specialistApplicationsApi = {
    async createApplication(
        payload: CreateSpecialistApplicationPayload,
    ): Promise<{ ok: true; application: SpecialistApplication }> {
        if (USE_MOCK) {
            return mockCreateApplication(payload);
        }

        return realCreateApplication(payload);
    },

    async getApplications(): Promise<SpecialistApplication[]> {
        if (USE_MOCK) {
            return mockGetApplications();
        }

        return realGetApplications();
    },

    async assignInterview(
        payload: AssignInterviewPayload,
    ): Promise<SpecialistApplication> {
        if (USE_MOCK) {
            return mockAssignInterview(payload);
        }

        return realAssignInterview(payload);
    },

    async rejectApplication(
        payload: RejectSpecialistApplicationPayload,
    ): Promise<SpecialistApplication> {
        if (USE_MOCK) {
            return mockRejectApplication(payload);
        }

        return realRejectApplication(payload);
    },

    async approveApplication(
        payload: ApproveSpecialistApplicationPayload,
    ): Promise<SpecialistApplication> {
        if (USE_MOCK) {
            return mockApproveApplication(payload);
        }

        return realApproveApplication(payload);
    },

    async attachCreatedSpecialistAccount(
        payload: AttachCreatedSpecialistAccountPayload,
    ): Promise<SpecialistApplication> {
        if (USE_MOCK) {
            return mockAttachCreatedSpecialistAccount(payload);
        }


        return realAttachCreatedSpecialistAccount(payload);
    },
};
