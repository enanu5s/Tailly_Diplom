// src/pages/super-admin-password-recovery/ui/SuperAdminPasswordRecoveryPage.tsx
import { AdminPasswordRecoveryManagementSection } from '@/features/admin-password-recovery-management';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './SuperAdminPasswordRecoveryPage.module.css';

import type { ReactElement } from 'react';

export function SuperAdminPasswordRecoveryPage(): ReactElement {
  const navigate = useAppNavigate();

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <AdminPasswordRecoveryManagementSection />
      </div>
    </section>
  );
}
