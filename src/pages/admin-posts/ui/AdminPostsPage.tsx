// src/pages/admin-posts/ui/AdminPostsPage.tsx
import { AdminPostsBannersManagementSection } from '@/features/admin-posts-banners-management';

import styles from './AdminPostsPage.module.css';

import type { ReactElement } from 'react';

export function AdminPostsPage(): ReactElement {
  return (
    <div className={styles.page}>
      <AdminPostsBannersManagementSection />
    </div>
  );
}
