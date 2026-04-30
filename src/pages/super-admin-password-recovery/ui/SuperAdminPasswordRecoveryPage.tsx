// src/pages/super-admin-password-recovery/ui/SuperAdminPasswordRecoveryPage.tsx
import { AdminPasswordRecoveryManagementSection } from '@/features/admin-password-recovery-management';

import styles from './SuperAdminPasswordRecoveryPage.module.css';

import type { ReactElement } from 'react';

export function SuperAdminPasswordRecoveryPage(): ReactElement {

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <AdminPasswordRecoveryManagementSection />
      </div>
    </section>
  );
}
