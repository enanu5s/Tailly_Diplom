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
        >
          <svg
            className={styles.backIcon}
            width="24"
            height="15"
            viewBox="0 0 24 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7.44922 0.949637L0.949612 7.44924M0.949612 7.44924L7.44922 13.9492M0.949612 7.44924L22.9492 7.44918"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Назад
        </BackButton>

        <SpecialistApplicationsModerationSection />
      </div>
    </section>
  );
}
