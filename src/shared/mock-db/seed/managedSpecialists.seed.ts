// src/shared/mock-db/seed/managedSpecialists.seed.ts

import type { ManagedSpecialistMockAccount } from '@/shared/lib/mock/specialistAccountsStorage';

import {
  buildDemoSpecialistSpecs,
  buildExtraManagedSpecialists,
} from './demoDataset.seed';

const PRIMARY_SPECIALIST: ManagedSpecialistMockAccount = {
  id: 'specialist-1',
  email: 'specialist@tailly.local',
  password: '123456',
  role: 'specialist',
  firstName: 'Мария',
  lastName: 'Иванова',
  middleName: '',
  phone: '+7 (900) 000-00-20',
  city: 'Москва',
  about: 'Опыт ухода за животными, базовый тестовый специалист.',
  specialistId: 'specialist-1',
  specialistSlug: 'maria-ivanova',
  applicationId: undefined,
  createdAt: '2026-03-01T10:00:00.000Z',
  createdBy: 'system',
  isBlocked: false,
  blockReason: undefined,
  blockedUntil: undefined,
  isPermanentBlock: false,
};

const specialistSpecs = buildDemoSpecialistSpecs();

export const SEED_MANAGED_SPECIALISTS: ManagedSpecialistMockAccount[] = [
  PRIMARY_SPECIALIST,
  ...buildExtraManagedSpecialists(specialistSpecs),
];
