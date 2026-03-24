// src/pages/admin-posts/ui/AdminPostsPage.tsx
import { AdminPostsBannersManagementSection } from "@/features/admin-posts-banners-management";
import { BackButton } from "@/shared/ui/back-button";


import styles from "./AdminPostsPage.module.css";

import type { ReactElement } from "react";

export function AdminPostsPage(): ReactElement {

  return (
    <div className={styles.page}>
      <BackButton
        className={styles.backButton}
        fallbackTo="/admin"
        label="Назад в админ-панель"
      />

      <AdminPostsBannersManagementSection />
    </div>
  );
}
