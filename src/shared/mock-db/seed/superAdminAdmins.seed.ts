// src/shared/mock-db/seed/superAdminAdmins.seed.ts

import type { ManagedAdmin } from '@/features/super-admin-admins-management/model/types';

import { buildExtraManagedAdmins } from './demoDataset.seed';

type SeedAdmin = ManagedAdmin & { temporaryPassword?: string };

const CORE_SUPER_ADMIN_ADMINS: SeedAdmin[] = [
  {
    id: 'super-admin-1',
    adminId: 'super-admin-1',
    email: 'superadmin@tailly.local',
    firstName: 'Мария',
    lastName: 'Петрова',
    middleName: 'Александровна',
    birthDate: '1988-06-14',
    phone: '+7 (900) 000-00-02',
    position: 'Главный администратор',
    department: 'Администрация',
    status: 'active',
    role: 'super_admin',
    createdAt: '2026-01-10T09:00:00.000Z',
    createdBy: 'system',
    lastLoginAt: '2026-03-11T09:30:00.000Z',
  },
  {
    id: 'admin-1',
    adminId: 'admin-1',
    email: 'admin@tailly.local',
    firstName: 'Анна',
    lastName: 'Иванова',
    middleName: 'Сергеевна',
    birthDate: '1993-03-21',
    phone: '+7 (900) 000-00-01',
    position: 'Администратор поддержки',
    department: 'Поддержка',
    status: 'active',
    role: 'admin',
    createdAt: '2026-02-03T10:00:00.000Z',
    createdBy: 'super-admin-1',
    lastLoginAt: '2026-03-10T15:15:00.000Z',
  },
];

export const SEED_SUPER_ADMIN_ADMINS: SeedAdmin[] = [
  ...CORE_SUPER_ADMIN_ADMINS,
  ...buildExtraManagedAdmins(),
];
