// src/pages/admin-profile/ui/AdminProfilePage.tsx
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { AdminProfileSection } from '@/features/admin-profile';

import styles from './AdminProfilePage.module.css';

import type { ReactElement } from 'react';

export function AdminProfilePage(): ReactElement {
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

        <AdminProfileSection />
      </div>
    </section>
  );
}