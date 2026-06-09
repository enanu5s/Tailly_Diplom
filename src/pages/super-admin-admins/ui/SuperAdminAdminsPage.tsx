// src/pages/super-admin-admins/ui/SuperAdminAdminsPage.tsx

import { SuperAdminAdminsManagementSection } from '@/features/super-admin-admins-management';

import styles from './SuperAdminAdminsPage.module.css';

import type { ReactElement } from 'react';

export function SuperAdminAdminsPage(): ReactElement {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <SuperAdminAdminsManagementSection />
      </div>
    </section>
  );
}
