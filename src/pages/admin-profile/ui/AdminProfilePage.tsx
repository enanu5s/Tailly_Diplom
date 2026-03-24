// src/pages/admin-profile/ui/AdminProfilePage.tsx
import { AdminProfileSection } from "@/features/admin-profile";
import { BackButton } from '@/shared/ui/back-button';

import styles from "./AdminProfilePage.module.css";

import type { ReactElement } from "react";

export function AdminProfilePage(): ReactElement {

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <BackButton
          className={styles.backButton}
          fallbackTo="/admin"
          label="Назад в админ-панель"
        />

        <AdminProfileSection />
      </div>
    </section>
  );
}
