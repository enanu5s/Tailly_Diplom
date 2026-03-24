// src/shared/mock-db/types.ts

import type { City } from '@/features/auth/api/registerApi';
import type {
  AccountSoftDeleteRecord,
  MockAccountDeletionEmail,
} from '@/features/auth/data/mockAccountDeletionStorage';
import type { MockAdminPasswordRecoveryRequest } from '@/features/auth/data/mockAdminPasswordRecoveryRequests';
import type {
  MockAuthAccount,
  MockAttemptState,
} from '@/features/auth/data/mockAuthAccounts';
import type { ProductOrder, ServiceOrder } from '@/features/orders/model/types';
import type { Breed, Pet } from '@/features/pets/model/types';
import type { UserProfile } from '@/features/profile/model/types';
import type { Review, ReviewContext } from '@/features/reviews/model/types';
import type {
  Order,
  PickupPoint,
  Product,
  ProductCategory,
} from '@/features/shop/model/types';
import type { SpecialistApplication } from '@/features/specialist-applications/model/types';
import type { MockAdminRecord } from '@/features/super-admin-admins-management/data/mockAdminsManagement';
import type { ManagedSpecialistMockAccount } from '@/shared/lib/mock/specialistAccountsStorage';

import type { MOCK_DB_VERSION } from './constants';

export type MockDbMeta = {
  schemaVersion: typeof MOCK_DB_VERSION;
  /** Старые ключи localStorage уже смержены в этот снимок */
  legacyImported?: boolean;
};

export type MockRegisterSlice = {
  lastCode: string;
  registrationId: string;
  verificationToken: string;
  email: string;
  cities: City[];
};

export type MockDbSnapshot = {
  version: typeof MOCK_DB_VERSION;
  meta: MockDbMeta;
  auth: {
    baseAccounts: MockAuthAccount[];
    adminAttempts: Record<string, MockAttemptState>;
  };
  specialists: {
    managed: ManagedSpecialistMockAccount[];
  };
  accountDeletion: {
    softDeleteByUserId: Record<string, AccountSoftDeleteRecord>;
    permanentUserIds: string[];
    deletionEmailOutbox: MockAccountDeletionEmail[];
  };
  orders: {
    service: ServiceOrder[];
  };
  shop: {
    categories: ProductCategory[];
    products: Product[];
    orders: Order[];
    pickupPoints: PickupPoint[];
  };
  client: {
    defaultUserId: string;
    profiles: Record<string, UserProfile>;
    petsByUserId: Record<string, Pet[]>;
    breeds: Breed[];
  };
  reviews: {
    contexts: Record<string, ReviewContext>;
    list: Review[];
  };
  applications: {
    specialist: SpecialistApplication[];
  };
  superAdmin: {
    admins: MockAdminRecord[];
  };
  adminPasswordRecovery: {
    requests: MockAdminPasswordRecoveryRequest[];
  };
  register: MockRegisterSlice;
  /** Статические товарные заказы (легаси-виджеты); синхронизируются с заказами магазина по смыслу */
  legacyProductOrders: ProductOrder[];
};

export type { MockAttemptState, MockAuthAccount };
