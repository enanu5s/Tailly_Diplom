// src/pages/admin-specialist-applications/ui/AdminSpecialistApplicationsPage.tsx

import { SpecialistApplicationsModerationSection } from '@/features/specialist-applications/ui/SpecialistApplicationsModerationSection';
import { BackButton } from '@/shared/ui/back-button';

import styles from './AdminSpecialistApplicationsPage.module.css';

import type { ReactElement } from 'react';

export function AdminSpecialistApplicationsPage(): ReactElement {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <BackButton
          className={styles.backButton}
          fallbackTo="/admin"
          label="Назад в админ-панель"
        />

        <SpecialistApplicationsModerationSection />
      </div>
    </section>
  );
}
