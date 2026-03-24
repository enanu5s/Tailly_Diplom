// src/pages/super-admin-admins/ui/SuperAdminAdminsPage.tsx

import { SuperAdminAdminsManagementSection } from '@/features/super-admin-admins-management';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './SuperAdminAdminsPage.module.css';

import type { ReactElement } from 'react';

export function SuperAdminAdminsPage(): ReactElement {
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

        <SuperAdminAdminsManagementSection />
      </div>
    </section>
  );
}
