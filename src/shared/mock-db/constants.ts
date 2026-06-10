// src/shared/mock-db/constants.ts

export const MOCK_DB_STORAGE_KEY = 'tailly_mock_db_v1';
export const MOCK_DB_VERSION = 4 as const;

/** Префикс старых ключей localStorage до объединения */
export const LEGACY_KEYS = {
  specialists: 'tailly_managed_specialist_accounts',
  softDelete: 'tailly_account_soft_delete_by_user_id',
  permanentUsers: 'tailly_permanently_deleted_user_ids',
  deletionEmails: 'tailly_mock_account_deletion_emails',
  serviceOrders: 'tailly_mock_service_orders',
  shopOrders: 'tailly_shop_orders',
  applications: 'tailly_specialist_applications',
  adminPosts: 'tailly_admin_managed_posts',
  adminBanners: 'tailly_admin_managed_banners',
  messageThreads: 'tailly_messages_threads',
  messageItems: 'tailly_messages_messages',
} as const;
