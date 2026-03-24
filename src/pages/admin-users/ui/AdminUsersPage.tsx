// src/pages/admin-users/ui/AdminUsersPage.tsx

import { AdminUsersManagementSection } from "@/features/admin-users-management";
import { BackButton } from "@/shared/ui/back-button";

import styles from "./AdminUsersPage.module.css";

import type { ReactElement } from "react";

export function AdminUsersPage(): ReactElement {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <BackButton
          className={styles.backButton}
          fallbackTo="/admin"
          label="Назад в админ-панель"
        />

        <AdminUsersManagementSection />
      </div>
    </section>
  );
}
