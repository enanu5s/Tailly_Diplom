// src/shared/mock-db/buildInitialSnapshot.ts

import {
  cloneApplications,
  INITIAL_APPLICATIONS,
} from '@/features/specialist-applications/data/mockSpecialistApplications';

import { cloneDeep } from './cloneDeep';
import { MOCK_DB_VERSION } from './constants';
import { SEED_ACCOUNTS } from './seed/accounts.seed';
import { SEED_SUPER_ADMIN_ADMINS } from './seed/admins.seed';
import { SEED_BREEDS } from './seed/breeds.seed';
import {
  buildSeedClientPets,
  buildSeedClientProfiles,
  SEED_DEFAULT_CLIENT_ID,
} from './seed/clients.seed';
import { SEED_CMS_BANNERS, SEED_CMS_DATA_REVISION, SEED_CMS_POSTS } from './seed/cms.seed';
import { SEED_MESSAGE_THREADS, SEED_MESSAGES } from './seed/messages.seed';
import { buildSeedServiceOrders } from './seed/orders.seed';
import { SEED_PICKUP_POINTS } from './seed/pickupPoints.seed';
import { buildSeedReviewsFromOrders } from './seed/reviews.seed';
import { buildExtraShopProducts } from './seed/shopExtraProducts.seed';
import { SEED_SHOP_CATEGORIES, SEED_SHOP_PRODUCTS } from './seed/shop.seed';
import { buildSeedProductOrders } from './seed/shopOrders.seed';
import { SEED_MANAGED_SPECIALISTS, SEED_SPECIALIST_PROFILES } from './seed/specialists.seed';

import type { MockDbSnapshot } from './types';

export function buildInitialSnapshot(): MockDbSnapshot {
  const serviceOrders = buildSeedServiceOrders();
  const reviewsSeed = buildSeedReviewsFromOrders(serviceOrders);

  return {
    version: MOCK_DB_VERSION,
    meta: {
      schemaVersion: MOCK_DB_VERSION,
      cmsDataRevision: SEED_CMS_DATA_REVISION,
    },
    auth: {
      baseAccounts: cloneDeep(SEED_ACCOUNTS),
      adminAttempts: {},
    },
    specialists: {
      managed: cloneDeep(SEED_MANAGED_SPECIALISTS),
      profiles: cloneDeep(SEED_SPECIALIST_PROFILES),
    },
    accountDeletion: {
      softDeleteByUserId: {},
      permanentUserIds: [],
      deletionEmailOutbox: [],
    },
    orders: {
      service: cloneDeep(serviceOrders),
      product: cloneDeep(buildSeedProductOrders()),
    },
    shop: {
      categories: cloneDeep(SEED_SHOP_CATEGORIES),
      products: cloneDeep([...SEED_SHOP_PRODUCTS, ...buildExtraShopProducts()]),
      orders: [],
      pickupPoints: cloneDeep(SEED_PICKUP_POINTS),
      cartByKey: {},
      favoritesByKey: {},
    },
    client: {
      defaultUserId: SEED_DEFAULT_CLIENT_ID,
      profiles: cloneDeep(buildSeedClientProfiles()),
      petsByUserId: cloneDeep(buildSeedClientPets()),
      breeds: cloneDeep(SEED_BREEDS),
    },
    reviews: {
      contexts: cloneDeep(reviewsSeed.contexts),
      list: cloneDeep(reviewsSeed.list),
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
      password: '',
      cities: [
        { id: 'msk', name: 'Москва' },
        { id: 'spb', name: 'Санкт-Петербург' },
        { id: 'kzn', name: 'Казань' },
        { id: 'ekb', name: 'Екатеринбург' },
      ],
    },
    cms: {
      posts: cloneDeep(SEED_CMS_POSTS),
      banners: cloneDeep(SEED_CMS_BANNERS),
    },
    messages: {
      threads: cloneDeep(SEED_MESSAGE_THREADS),
      items: cloneDeep(SEED_MESSAGES),
    },
  };
}
