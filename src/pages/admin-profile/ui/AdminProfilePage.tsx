// src/pages/admin-profile/ui/AdminProfilePage.tsx
import { AdminProfileSection } from '@/features/admin-profile';

import styles from './AdminProfilePage.module.css';

import type { ReactElement } from 'react';

export function AdminProfilePage(): ReactElement {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <AdminProfileSection />
      </div>
    </section>
  );
}
