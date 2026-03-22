// src/pages/admin-users/ui/AdminUsersPage.tsx

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { AdminUsersManagementSection } from '@/features/admin-users-management';

import styles from './AdminUsersPage.module.css';

import type { ReactElement } from 'react';

export function AdminUsersPage(): ReactElement {
  const navigate = useAppNavigate();

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <button
          className={styles.backButton}
          type="button"
          onClick={() => navigate('/admin')}
        >
          Назад в админ-панель
        </button>

        <AdminUsersManagementSection />
      </div>
    </section>
  );
}