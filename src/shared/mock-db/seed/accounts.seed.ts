// src/shared/mock-db/seed/accounts.seed.ts
/** Единый реестр логинов, паролей и ролей для mock-БД. */

import type { MockAuthAccount } from '@/features/auth/data/mockAuthAccounts';

export const DEMO_CLIENT_PASSWORD = '12345678';
export const DEMO_SPECIALIST_PASSWORD = '12345678';
export const DEMO_ADMIN_PASSWORD = 'Admin123!';
export const DEMO_SUPER_ADMIN_PASSWORD = 'SuperAdmin123!';

/** @deprecated используйте DEMO_CLIENT_PASSWORD */
export const DEMO_CLIENT_SPECIALIST_PASSWORD = DEMO_CLIENT_PASSWORD;

/** @deprecated используйте DEMO_ADMIN_PASSWORD */
export const DEMO_ADMIN_PANEL_PASSWORD = DEMO_ADMIN_PASSWORD;

/** @deprecated используйте DEMO_SUPER_ADMIN_PASSWORD */
export const DEMO_SUPER_ADMIN_PANEL_PASSWORD = DEMO_SUPER_ADMIN_PASSWORD;

const MOSCOW_DISTRICTS = [
  'Пресненский район',
  'Хамовники',
  'Тверской район',
  'Басманный район',
  'Замоскворечье',
] as const;

const RUSSIA_CITIES = [
  'Санкт-Петербург',
  'Казань',
  'Екатеринбург',
  'Краснодар',
  'Новосибирск',
] as const;

export type SpecialistAccountMeta = {
  id: string;
  slug: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  city: string;
  district: string;
  phone: string;
  isDualRole: boolean;
};

export const SPECIALIST_ACCOUNT_META: SpecialistAccountMeta[] = [
  {
    id: 'specialist-1',
    slug: 'maria-ivanova',
    email: 'specialist@tailly.local',
    firstName: 'Мария',
    lastName: 'Иванова',
    middleName: 'Петровна',
    city: 'Москва',
    district: MOSCOW_DISTRICTS[0],
    phone: '+7 (900) 000-00-20',
    isDualRole: true,
  },
  {
    id: 'specialist-2',
    slug: 'igor-kozlov',
    email: 'specialist02@tailly.local',
    firstName: 'Игорь',
    lastName: 'Козлов',
    middleName: 'Андреевич',
    city: 'Москва',
    district: MOSCOW_DISTRICTS[1],
    phone: '+7 (901) 202-32-42',
    isDualRole: true,
  },
  {
    id: 'specialist-3',
    slug: 'olga-novikova',
    email: 'specialist03@tailly.local',
    firstName: 'Ольга',
    lastName: 'Новикова',
    middleName: 'Сергеевна',
    city: 'Москва',
    district: MOSCOW_DISTRICTS[2],
    phone: '+7 (901) 203-33-43',
    isDualRole: false,
  },
  {
    id: 'specialist-4',
    slug: 'dmitry-sokolov',
    email: 'specialist04@tailly.local',
    firstName: 'Дмитрий',
    lastName: 'Соколов',
    middleName: 'Игоревич',
    city: 'Москва',
    district: MOSCOW_DISTRICTS[3],
    phone: '+7 (901) 204-34-44',
    isDualRole: false,
  },
  {
    id: 'specialist-5',
    slug: 'svetlana-volkova',
    email: 'specialist05@tailly.local',
    firstName: 'Светлана',
    lastName: 'Волкова',
    middleName: 'Олеговна',
    city: 'Москва',
    district: MOSCOW_DISTRICTS[4],
    phone: '+7 (901) 205-35-45',
    isDualRole: false,
  },
  {
    id: 'specialist-6',
    slug: 'pavel-orlov',
    email: 'specialist06@tailly.local',
    firstName: 'Павел',
    lastName: 'Орлов',
    middleName: 'Николаевич',
    city: RUSSIA_CITIES[0],
    district: 'Центральный район',
    phone: '+7 (901) 206-36-46',
    isDualRole: false,
  },
  {
    id: 'specialist-7',
    slug: 'natalya-pavlova',
    email: 'specialist07@tailly.local',
    firstName: 'Наталья',
    lastName: 'Павлова',
    middleName: 'Викторовна',
    city: RUSSIA_CITIES[1],
    district: 'Советский район',
    phone: '+7 (901) 207-37-47',
    isDualRole: false,
  },
  {
    id: 'specialist-8',
    slug: 'sergey-semenov',
    email: 'specialist08@tailly.local',
    firstName: 'Сергей',
    lastName: 'Семёнов',
    middleName: 'Александрович',
    city: RUSSIA_CITIES[2],
    district: 'Ленинский район',
    phone: '+7 (901) 208-38-48',
    isDualRole: false,
  },
  {
    id: 'specialist-9',
    slug: 'yulia-egorova',
    email: 'specialist09@tailly.local',
    firstName: 'Юлия',
    lastName: 'Егорова',
    middleName: 'Дмитриевна',
    city: RUSSIA_CITIES[3],
    district: 'Прикубанский округ',
    phone: '+7 (901) 209-39-49',
    isDualRole: false,
  },
  {
    id: 'specialist-10',
    slug: 'andrey-nikolaev',
    email: 'specialist10@tailly.local',
    firstName: 'Андрей',
    lastName: 'Николаев',
    middleName: 'Романович',
    city: RUSSIA_CITIES[4],
    district: 'Октябрьский район',
    phone: '+7 (901) 210-40-50',
    isDualRole: false,
  },
];

const CLIENT_NAMES = [
  { firstName: 'Елена', lastName: 'Смирнова', middleName: 'Игоревна', city: 'Москва', district: 'Пресненский район' },
  { firstName: 'Алексей', lastName: 'Козлов', middleName: 'Петрович', city: 'Москва', district: 'Хамовники' },
  { firstName: 'Ольга', lastName: 'Новикова', middleName: 'Сергеевна', city: 'Санкт-Петербург', district: 'Центральный район' },
  { firstName: 'Дмитрий', lastName: 'Соколов', middleName: 'Андреевич', city: 'Казань', district: 'Советский район' },
  { firstName: 'Светлана', lastName: 'Волкова', middleName: 'Олеговна', city: 'Екатеринбург', district: 'Ленинский район' },
  { firstName: 'Игорь', lastName: 'Лебедев', middleName: 'Николаевич', city: 'Краснодар', district: 'Прикубанский округ' },
  { firstName: 'Наталья', lastName: 'Морозова', middleName: 'Викторовна', city: 'Новосибирск', district: 'Октябрьский район' },
  { firstName: 'Павел', lastName: 'Орлов', middleName: 'Романович', city: 'Москва', district: 'Тверской район' },
] as const;

function clientEmail(index: number): string {
  if (index === 1) {
    return 'client@tailly.local';
  }

  return `client${String(index).padStart(2, '0')}@tailly.local`;
}

function buildClientAccounts(): MockAuthAccount[] {
  return CLIENT_NAMES.map((c, i) => {
    const index = i + 1;
    const id = `client-${index}`;

    return {
      id,
      email: clientEmail(index),
      password: DEMO_CLIENT_PASSWORD,
      roles: ['client'],
      firstName: c.firstName,
      lastName: c.lastName,
      middleName: c.middleName,
      phone: `+7 (900) ${100 + index}-${10 + index}-${20 + index}`,
      isBlocked: false,
    };
  });
}

function buildSpecialistAccounts(): MockAuthAccount[] {
  return SPECIALIST_ACCOUNT_META.map((s) => ({
    id: s.id,
    email: s.email,
    password: DEMO_SPECIALIST_PASSWORD,
    roles: s.isDualRole
      ? (['client', 'specialist'] as MockAuthAccount['roles'])
      : (['specialist'] as MockAuthAccount['roles']),
    firstName: s.firstName,
    lastName: s.lastName,
    middleName: s.middleName,
    phone: s.phone,
    specialistId: s.id,
    specialistSlug: s.slug,
    isBlocked: false,
  }));
}

const ADMIN_NAMES = [
  { firstName: 'Анна', lastName: 'Иванова', middleName: 'Сергеевна' },
  { firstName: 'Олег', lastName: 'Кузнецов', middleName: 'Андреевич' },
  { firstName: 'Ирина', lastName: 'Волкова', middleName: 'Петровна' },
  { firstName: 'Павел', lastName: 'Степанов', middleName: 'Николаевич' },
  { firstName: 'Светлана', lastName: 'Новикова', middleName: 'Олеговна' },
  { firstName: 'Никита', lastName: 'Михайлов', middleName: 'Романович' },
] as const;

function buildAdminAccounts(): MockAuthAccount[] {
  return ADMIN_NAMES.map((a, i) => {
    const index = i + 1;
    const n = String(index).padStart(2, '0');

    return {
      id: `admin-${index}`,
      email: index === 1 ? 'admin@tailly.local' : `admin${n}@tailly.local`,
      password: DEMO_ADMIN_PASSWORD,
      roles: ['admin'],
      firstName: a.firstName,
      lastName: a.lastName,
      middleName: a.middleName,
      phone: `+7 (902) ${10 + index}-${20 + index}-${30 + index}`,
      adminId: `admin-${index}`,
      isBlocked: false,
    };
  });
}

const SUPER_ADMIN_ACCOUNT: MockAuthAccount = {
  id: 'super-admin-1',
  email: 'superadmin@tailly.local',
  password: DEMO_SUPER_ADMIN_PASSWORD,
  roles: ['super_admin'],
  firstName: 'Мария',
  lastName: 'Петрова',
  middleName: 'Александровна',
  phone: '+7 (900) 000-00-02',
  adminId: 'super-admin-1',
  isBlocked: false,
};

export const SEED_ACCOUNTS: MockAuthAccount[] = [
  ...buildClientAccounts(),
  ...buildSpecialistAccounts(),
  ...buildAdminAccounts(),
  SUPER_ADMIN_ACCOUNT,
];

export { CLIENT_NAMES, MOSCOW_DISTRICTS, RUSSIA_CITIES };
