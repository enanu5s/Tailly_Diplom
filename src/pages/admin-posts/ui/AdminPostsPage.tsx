// src/pages/admin-posts/ui/AdminPostsPage.tsx
import { useNavigate } from 'react-router-dom';

import { AdminPostsBannersManagementSection } from '@/features/admin-posts-banners-management';

import styles from './AdminPostsPage.module.css';

import type { ReactElement } from 'react';

export function AdminPostsPage(): ReactElement {
  const navigate = useNavigate();

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