// src/pages/super-admin-password-recovery/ui/SuperAdminPasswordRecoveryPage.tsx
import { useNavigate } from 'react-router-dom';

import { AdminPasswordRecoveryManagementSection } from '@/features/admin-password-recovery-management';

import styles from './SuperAdminPasswordRecoveryPage.module.css';

import type { ReactElement } from 'react';

export function SuperAdminPasswordRecoveryPage(): ReactElement {
  const navigate = useNavigate();

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

        <AdminPasswordRecoveryManagementSection />
      </div>
    </section>
  );
}