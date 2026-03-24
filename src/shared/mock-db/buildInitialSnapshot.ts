// src/shared/mock-db/buildInitialSnapshot.ts

import { MOCK_PRODUCT_ORDERS_SEED } from '@/features/orders/data/mockProductOrdersSeed';
import { MOCK_BREEDS } from '@/features/pets/data/mockPets';
import type { Pet } from '@/features/pets/model/types';
import type { UserProfile } from '@/features/profile/model/types';
import { SHOP_CATEGORIES_MOCK, SHOP_PRODUCTS_MOCK } from '@/features/shop/data/mockShop';
import { SHOP_DEMO_EXTRA_PRODUCTS } from '@/features/shop/data/mockShopExtraProducts';
import {
  cloneApplications,
  INITIAL_APPLICATIONS,
} from '@/features/specialist-applications/data/mockSpecialistApplications';

import { cloneDeep } from './cloneDeep';
import { MOCK_DB_VERSION } from './constants';
import { SEED_AUTH_BASE_ACCOUNTS } from './seed/authBaseAccounts.seed';
import { buildExtraClientProfilesAndPets } from './seed/demoDataset.seed';
import { SEED_MANAGED_SPECIALISTS } from './seed/managedSpecialists.seed';
import { SEED_PICKUP_POINTS } from './seed/pickupPoints.seed';
import { SEED_SUPER_ADMIN_ADMINS } from './seed/superAdminAdmins.seed';

import type { MockDbSnapshot } from './types';

const DEFAULT_CLIENT_ID = 'client-1';

const SEED_CLIENT_PROFILE: UserProfile = {
  id: DEFAULT_CLIENT_ID,
  firstName: 'Елена',
  lastName: 'Смирнова',
  middleName: 'Игоревна',
  city: 'Москва',
  phone: '+7 (900) 000-00-10',
  email: 'client@tailly.local',
  avatarUrl: '/images/profile-avatar.png',
};

const EXTRA_CLIENT = buildExtraClientProfilesAndPets();

const SEED_CLIENT_PETS: Pet[] = [
  {
    id: 'pet-1',
    name: 'Марта',
    type: 'dog',
    breedId: 'b-dog-1',
    ageYears: 4,
    ageMonths: 0,
    size: 'm',
    gender: 'female',
    toOtherPets: 'friendly',
    toKidsUnder10: 'friendly',
    staysHomeAlone: 'ok',
    vaccinated: 'yes',
    notes: 'Активная, любит длительные прогулки.',
    photoUrl: '/images/pet-dog.png',
  },
  {
    id: 'pet-2',
    name: 'Пушок',
    type: 'cat',
    breedId: 'b-cat-1',
    ageYears: 2,
    ageMonths: 3,
    size: 's',
    gender: 'male',
    toOtherPets: 'neutral',
    toKidsUnder10: 'neutral',
    staysHomeAlone: 'ok',
    vaccinated: 'yes',
    notes: 'Нужен спокойный темп знакомства.',
    photoUrl: undefined,
  },
  {
    id: 'pet-3',
    name: 'Снежок',
    type: 'cat',
    breedId: 'b-cat-2',
    ageYears: 6,
    ageMonths: 0,
    size: 'm',
    gender: 'male',
    toOtherPets: 'friendly',
    toKidsUnder10: 'friendly',
    staysHomeAlone: 'ok',
    vaccinated: 'yes',
    notes: 'Передержка: отдельная зона и привычный корм.',
    photoUrl: undefined,
  },
];

export function buildInitialSnapshot(): MockDbSnapshot {
  return {
    version: MOCK_DB_VERSION,
    meta: {
      schemaVersion: MOCK_DB_VERSION,
    },
    auth: {
      baseAccounts: cloneDeep(SEED_AUTH_BASE_ACCOUNTS),
      adminAttempts: {},
    },
    specialists: {
      managed: cloneDeep(SEED_MANAGED_SPECIALISTS),
    },
    accountDeletion: {
      softDeleteByUserId: {},
      permanentUserIds: [],
      deletionEmailOutbox: [],
    },
    orders: {
      service: [],
    },
    shop: {
      categories: cloneDeep(SHOP_CATEGORIES_MOCK),
      products: cloneDeep([...SHOP_PRODUCTS_MOCK, ...SHOP_DEMO_EXTRA_PRODUCTS]),
      orders: [],
      pickupPoints: cloneDeep(SEED_PICKUP_POINTS),
    },
    client: {
      defaultUserId: DEFAULT_CLIENT_ID,
      profiles: {
        [DEFAULT_CLIENT_ID]: cloneDeep(SEED_CLIENT_PROFILE),
        ...cloneDeep(EXTRA_CLIENT.profiles),
      },
      petsByUserId: {
        [DEFAULT_CLIENT_ID]: cloneDeep(SEED_CLIENT_PETS),
        ...cloneDeep(EXTRA_CLIENT.petsByUserId),
      },
      breeds: cloneDeep(MOCK_BREEDS),
    },
    reviews: {
      contexts: {},
      list: [],
    },
    applications: {
      specialist: cloneApplications(INITIAL_APPLICATIONS),
    },
    superAdmin: {
      admins: cloneDeep(SEED_SUPER_ADMIN_ADMINS),
    },
    adminPasswordRecovery: {
      requests: [],
    },
    register: {
      lastCode: '123456',
      registrationId: 'reg_1',
      verificationToken: 'verif_1',
      email: '',
      cities: [
        { id: 'msk', name: 'Москва' },
        { id: 'spb', name: 'Санкт-Петербург' },
        { id: 'kzn', name: 'Казань' },
        { id: 'ekb', name: 'Екатеринбург' },
      ],
    },
    legacyProductOrders: cloneDeep(MOCK_PRODUCT_ORDERS_SEED),
  };
}
