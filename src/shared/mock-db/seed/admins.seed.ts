// src/shared/mock-db/seed/admins.seed.ts

import type { ManagedAdmin } from '@/features/super-admin-admins-management/model/types';

const ADMIN_DEPARTMENTS = [
  'Поддержка',
  'Модерация',
  'Контент',
  'Поддержка',
  'Модерация',
  'Контент',
] as const;

const ADMIN_NAMES = [
  { firstName: 'Анна', lastName: 'Иванова', middleName: 'Сергеевна', email: 'admin@tailly.local', id: 'admin-1' },
  { firstName: 'Олег', lastName: 'Кузнецов', middleName: 'Андреевич', email: 'admin02@tailly.local', id: 'admin-2' },
  { firstName: 'Ирина', lastName: 'Волкова', middleName: 'Петровна', email: 'admin03@tailly.local', id: 'admin-3' },
  { firstName: 'Павел', lastName: 'Степанов', middleName: 'Николаевич', email: 'admin04@tailly.local', id: 'admin-4' },
  { firstName: 'Светлана', lastName: 'Новикова', middleName: 'Олеговна', email: 'admin05@tailly.local', id: 'admin-5' },
  { firstName: 'Никита', lastName: 'Михайлов', middleName: 'Романович', email: 'admin06@tailly.local', id: 'admin-6' },
] as const;

export const SEED_SUPER_ADMIN_ADMINS: ManagedAdmin[] = [
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
  ...ADMIN_NAMES.map((a, i) => {
    const day = String(Math.min(28, 10 + (i % 17))).padStart(2, '0');
    const month = String(Math.min(12, 1 + (i % 11))).padStart(2, '0');
    const birthYear = 1985 + (i % 12);

    return {
      id: a.id,
      adminId: a.id,
      email: a.email,
      firstName: a.firstName,
      lastName: a.lastName,
      middleName: a.middleName,
      birthDate: `${birthYear}-${month}-${day}`,
      phone: `+7 (902) ${10 + i + 1}-${20 + i + 1}-${30 + i + 1}`,
      position: 'Администратор поддержки',
      department: ADMIN_DEPARTMENTS[i]!,
      status: 'active' as const,
      role: 'admin' as const,
      createdAt: `2026-02-${day}T11:00:00.000Z`,
      createdBy: 'super-admin-1',
      lastLoginAt: i % 3 === 0 ? `2026-03-${day}T08:00:00.000Z` : null,
    };
  }),
];
