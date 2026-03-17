// src/features/specialist-applications/data/mockSpecialistApplications.ts

import type { SpecialistApplication } from '../model/types';

export const STORAGE_KEY = 'tailly_specialist_applications';

export const INITIAL_APPLICATIONS: SpecialistApplication[] = [
  {
    id: 'specialist-application-1',
    fullName: 'Екатерина Морозова',
    email: 'morozova@example.com',
    phone: '+7 (900) 555-12-12',
    city: 'Москва',
    about:
      'Уже 4 года ухаживаю за собаками и кошками друзей и знакомых, умею работать с тревожными питомцами.',
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
    about:
      'Работала волонтёром в приюте, умею давать лекарства по расписанию, готова брать заказы на передержку.',
    status: 'interview_assigned',
    createdAt: '2026-03-08T12:00:00.000Z',
    updatedAt: '2026-03-10T10:30:00.000Z',
    interviewDate: '2026-03-14T15:00',
    reviewComment:
      'Назначить онлайн-собеседование и уточнить опыт с крупными породами.',
    reviewedBy: 'superadmin@tailly.local',
    createdSpecialistId: null,
    createdSpecialistSlug: null,
    specialistAccountCreatedAt: null,
  },
];

export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function generateId(): string {
  return `specialist-application-${Math.random().toString(36).slice(2, 10)}`;
}

export function cloneApplications(
  applications: SpecialistApplication[],
): SpecialistApplication[] {
  return JSON.parse(JSON.stringify(applications)) as SpecialistApplication[];
}

export function safeParseApplications(
  raw: string | null,
): SpecialistApplication[] {
  if (!raw) {
    return cloneApplications(INITIAL_APPLICATIONS);
  }

  try {
    const parsed = JSON.parse(raw) as SpecialistApplication[];

    if (!Array.isArray(parsed)) {
      return cloneApplications(INITIAL_APPLICATIONS);
    }

    return parsed;
  } catch {
    return cloneApplications(INITIAL_APPLICATIONS);
  }
}

export function readMockApplications(): SpecialistApplication[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return safeParseApplications(raw);
}

export function writeMockApplications(
  applications: SpecialistApplication[],
): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

export function ensureMockSeed(): void {
  const existing = localStorage.getItem(STORAGE_KEY);

  if (!existing) {
    writeMockApplications(cloneApplications(INITIAL_APPLICATIONS));
  }
}

export function normalizeOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}