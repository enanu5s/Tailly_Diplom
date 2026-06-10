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
import type { SpecialistProfileResponse } from '@/features/specialist-profile/model/types';
import type { ProductOrder, ServiceOrder } from '@/features/orders/model/types';
import type { StoredCartItem } from '@/features/shop/model/shopCartStore';
import type { Breed, Pet } from '@/features/pets/model/types';
import type { UserProfile } from '@/features/profile/model/types';
import type { Review, ReviewContext } from '@/features/reviews/model/types';
import type {
  Order,
  PickupPoint,
  Product,
  ProductCategory,
} from '@/features/shop/model/types';
import type { AdminManagedBanner, AdminManagedPost } from '@/features/admin-posts-banners-management/model/types';
import type { ChatMessage, StoredMessageThread } from '@/features/messages/model/types';
import type { SpecialistApplication } from '@/features/specialist-applications/model/types';
import type { MockAdminRecord } from '@/features/super-admin-admins-management/data/mockAdminsManagement';
import type { ManagedSpecialistMockAccount } from '@/shared/lib/mock/specialistAccountsStorage';

import type { MOCK_DB_VERSION } from './constants';

export type MockDbMeta = {
  schemaVersion: typeof MOCK_DB_VERSION;
  /** Версия сида CMS (посты/баннеры) — при смене пересобираем `cms` из `cms.seed.ts` */
  cmsDataRevision?: number;
  /** Старые ключи localStorage уже смержены в этот снимок */
  legacyImported?: boolean;
};

export type MockRegisterSlice = {
  lastCode: string;
  registrationId: string;
  verificationToken: string;
  email: string;
  /** Пароль текущей сессии регистрации (только для мока) */
  password: string;
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
    profiles: SpecialistProfileResponse[];
  };
  accountDeletion: {
    softDeleteByUserId: Record<string, AccountSoftDeleteRecord>;
    permanentUserIds: string[];
    deletionEmailOutbox: MockAccountDeletionEmail[];
  };
  orders: {
    service: ServiceOrder[];
    product: ProductOrder[];
  };
  shop: {
    categories: ProductCategory[];
    products: Product[];
    orders: Order[];
    pickupPoints: PickupPoint[];
    cartByKey: Record<string, StoredCartItem[]>;
    favoritesByKey: Record<string, string[]>;
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
  /** Посты и баннеры админки (раньше — отдельные LS/IDB) */
  cms: {
    posts: AdminManagedPost[];
    banners: AdminManagedBanner[];
  };
  /** Чаты: потоки и сообщения (раньше — отдельные ключи LS) */
  messages: {
    threads: StoredMessageThread[];
    items: ChatMessage[];
  };
};

export type { MockAttemptState, MockAuthAccount };
