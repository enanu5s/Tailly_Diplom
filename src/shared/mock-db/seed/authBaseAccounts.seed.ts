// src/shared/mock-db/seed/authBaseAccounts.seed.ts

import type { MockAuthAccount } from '@/features/auth/data/mockAuthAccounts';

import {
  buildDemoSpecialistSpecs,
  buildExtraAdminAuthAccounts,
  buildExtraClientAccounts,
  buildExtraSpecialistAuthAccounts,
  DEMO_ADMIN_PANEL_PASSWORD,
  DEMO_SUPER_ADMIN_PANEL_PASSWORD,
} from './demoDataset.seed';

/** Ключевые аккаунты (демо) + много клиентов и специалистов */
const CORE_AUTH_ACCOUNTS: MockAuthAccount[] = [
  {
    id: 'client-1',
    email: 'client@tailly.local',
    password: '123456',
    roles: ['client'],
    firstName: 'Елена',
    lastName: 'Смирнова',
    phone: '+7 (900) 000-00-10',
    isBlocked: false,
  },
  {
    id: 'specialist-1',
    email: 'specialist@tailly.local',
    password: '123456',
    roles: ['client', 'specialist'],
    firstName: 'Мария',
    lastName: 'Иванова',
    middleName: '',
    phone: '+7 (900) 000-00-20',
    specialistId: 'specialist-1',
    specialistSlug: 'maria-ivanova',
    isBlocked: false,
  },
  {
    id: 'admin-1',
    email: 'admin@tailly.local',
    password: DEMO_ADMIN_PANEL_PASSWORD,
    roles: ['admin'],
    firstName: 'Анна',
    lastName: 'Иванова',
    middleName: 'Сергеевна',
    phone: '+7 (900) 000-00-01',
    adminId: 'admin-1',
    isBlocked: false,
  },
  {
    id: 'super-admin-1',
    email: 'superadmin@tailly.local',
    password: DEMO_SUPER_ADMIN_PANEL_PASSWORD,
    roles: ['super_admin'],
    firstName: 'Мария',
    lastName: 'Петрова',
    middleName: 'Александровна',
    phone: '+7 (900) 000-00-02',
    adminId: 'super-admin-1',
    isBlocked: false,
  },
];

const specialistSpecs = buildDemoSpecialistSpecs();

export const SEED_AUTH_BASE_ACCOUNTS: MockAuthAccount[] = [
  ...CORE_AUTH_ACCOUNTS,
  ...buildExtraAdminAuthAccounts(),
  ...buildExtraClientAccounts(),
  ...buildExtraSpecialistAuthAccounts(specialistSpecs),
];
