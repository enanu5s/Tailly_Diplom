// src/features/specialist-applications/data/mockSpecialistApplications.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import { createEmptySpecialistApplicationQuestionnaire } from '../model/types';

import type { SpecialistApplication, SpecialistApplicationStatus } from '../model/types';

const BULK_APPLICANT_NAMES: [string, string][] = [
  ['Артём', 'Воронов'],
  ['Полина', 'Жукова'],
  ['Кирилл', 'Титов'],
  ['Алина', 'Белова'],
  ['Максим', 'Громов'],
  ['Виктория', 'Савельева'],
  ['Денис', 'Крылов'],
  ['Оксана', 'Макарова'],
  ['Илья', 'Зуев'],
  ['Надежда', 'Рыбакова'],
  ['Станислав', 'Котов'],
  ['Людмила', 'Орлова'],
  ['Григорий', 'Панов'],
  ['Ева', 'Соловьёва'],
  ['Тимур', 'Власов'],
  ['Ксения', 'Гусева'],
];

const BULK_CITIES = [
  'Казань',
  'Екатеринбург',
  'Краснодар',
  'Нижний Новгород',
  'Москва',
  'Санкт-Петербург',
];

const BULK_STATUSES: SpecialistApplicationStatus[] = [
  'pending_review',
  'interview_assigned',
  'approved',
  'rejected',
];

function buildBulkSpecialistApplications(): SpecialistApplication[] {
  const out: SpecialistApplication[] = [];

  for (let i = 3; i <= 20; i += 1) {
    const [firstName, lastName] =
      BULK_APPLICANT_NAMES[(i - 3) % BULK_APPLICANT_NAMES.length];
    const city = BULK_CITIES[(i - 3) % BULK_CITIES.length];
    const status = BULK_STATUSES[(i - 3) % BULK_STATUSES.length];
    const day = String(3 + (i % 25)).padStart(2, '0');

    out.push({
      id: `specialist-application-${i}`,
      fullName: `${firstName} ${lastName}`,
      email: `applicant${i}@example.com`,
      phone: `+7 (900) ${100 + i}-${20 + i}-${30 + i}`,
      city,
      about: `Демо-заявка №${i}: опыт ухода за животными, готов(а) к заказам в городе ${city}.`,
      questionnaire: {
        experienceYears: i % 2 === 0 ? '3–5 лет' : '1–3 года',
        animalTypes: i % 3 === 0 ? ['Собаки'] : ['Собаки', 'Кошки'],
        serviceFormats: ['Выгул', 'Передержка у клиента'],
        canGiveMedication: i % 2 === 0,
        canHandleDifficultBehavior: i % 4 !== 0,
        canTakeOvernightOrders: i % 5 === 0,
        hasOwnPets: i % 3 !== 0,
        hasPetFirstAidBasics: i % 2 === 0,
        housingType: 'Квартира, отдельная зона для питомца.',
        districtPreferences: `${city}, в пределах 40 минут транспортом.`,
        schedulePreferences: 'Будни и выходные по договорённости.',
        portfolioUrl: '',
        motivation: 'Хочу работать через платформу и наращивать репутацию.',
        additionalInfo: 'Демо-данные для списка заявок.',
      },
      status,
      createdAt: `2026-03-${day}T09:00:00.000Z`,
      updatedAt: `2026-03-${day}T12:00:00.000Z`,
      interviewDate: status === 'interview_assigned' ? `2026-03-${day}T15:00` : null,
      reviewComment:
        status === 'rejected'
          ? 'Не хватает подтверждённого опыта передержки.'
          : status === 'approved'
            ? 'Одобрено после проверки документов.'
            : null,
      reviewedBy: status === 'pending_review' ? null : 'superadmin@tailly.local',
      createdSpecialistId: status === 'approved' ? `specialist-seed-${i}` : null,
      createdSpecialistSlug: status === 'approved' ? `demo-applicant-${i}` : null,
      specialistAccountCreatedAt:
        status === 'approved' ? `2026-03-${day}T14:00:00.000Z` : null,
    });
  }

  return out;
}

export const INITIAL_APPLICATIONS: SpecialistApplication[] = [
  {
    id: 'specialist-application-1',
    fullName: 'Екатерина Морозова',
    email: 'morozova@example.com',
    phone: '+7 (900) 555-12-12',
    city: 'Москва',
    about:
      'Уже 4 года ухаживаю за собаками и кошками друзей и знакомых, умею работать с тревожными питомцами.',
    questionnaire: {
      experienceYears: '3–5 лет',
      animalTypes: ['Собаки', 'Кошки'],
      serviceFormats: ['Выгул', 'Дневной присмотр', 'Передержка у клиента'],
      canGiveMedication: true,
      canHandleDifficultBehavior: true,
      canTakeOvernightOrders: false,
      hasOwnPets: true,
      hasPetFirstAidBasics: true,
      housingType:
        'Квартира без маленьких детей, есть отдельная комната для адаптации питомца.',
      districtPreferences: 'Москва, САО и ЦАО, выезд в пределах 45 минут.',
      schedulePreferences: 'Будни после 18:00, выходные почти весь день.',
      portfolioUrl: 'https://example.com/morozova-pets',
      motivation:
        'Хочу развивать практику петситтинга как основную занятость и работать через прозрачную платформу.',
      additionalInfo:
        'Есть опыт сопровождения животных после операций и общения с ветеринаром по назначениям.',
    },
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
    questionnaire: {
      experienceYears: '1–3 года',
      animalTypes: ['Собаки', 'Кошки', 'Грызуны'],
      serviceFormats: ['Передержка у себя', 'Передержка у клиента', 'Ночной присмотр'],
      canGiveMedication: true,
      canHandleDifficultBehavior: false,
      canTakeOvernightOrders: true,
      hasOwnPets: false,
      hasPetFirstAidBasics: false,
      housingType: 'Съёмная двухкомнатная квартира, проживаю одна.',
      districtPreferences: 'Санкт-Петербург, Петроградский и Василеостровский районы.',
      schedulePreferences: 'Гибкий график, онлайн-собеседование по будням до 16:00.',
      portfolioUrl: '',
      motivation:
        'Хочу перейти из волонтёрства в оплачиваемую практику и работать с заказами на длительную передержку.',
      additionalInfo:
        'Комфортно работаю с несколькими питомцами одновременно, если у них совпадает режим.',
    },
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
  ...buildBulkSpecialistApplications(),
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

export function safeParseApplications(raw: string | null): SpecialistApplication[] {
  if (!raw) {
    return cloneApplications(INITIAL_APPLICATIONS);
  }

  try {
    const parsed = JSON.parse(raw) as SpecialistApplication[];

    if (!Array.isArray(parsed)) {
      return cloneApplications(INITIAL_APPLICATIONS);
    }

    return parsed.map((item) => ({
      ...item,
      questionnaire:
        item.questionnaire ?? createEmptySpecialistApplicationQuestionnaire(),
    }));
  } catch {
    return cloneApplications(INITIAL_APPLICATIONS);
  }
}

export function readMockApplications(): SpecialistApplication[] {
  ensureMockDatabaseLoaded();

  return cloneDeep(unsafeMutableMockDb().applications.specialist);
}

export function writeMockApplications(applications: SpecialistApplication[]): void {
  patchMockDatabase((db) => {
    db.applications.specialist = cloneApplications(applications);
  });
}

export function ensureMockSeed(): void {
  ensureMockDatabaseLoaded();
}

export function normalizeOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
