// src/pages/admin-posts/ui/AdminPostsPage.tsx
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { AdminPostsBannersManagementSection } from '@/features/admin-posts-banners-management';

import styles from './AdminPostsPage.module.css';

import type { ReactElement } from 'react';

export function AdminPostsPage(): ReactElement {
  const navigate = useAppNavigate();

  return (
    <div className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate('/admin')}
      >
        Назад в админ-панель
      </button>

      <AdminPostsBannersManagementSection />
    </div>
  );
}