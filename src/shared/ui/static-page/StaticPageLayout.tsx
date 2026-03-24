// src/shared/ui/static-page/StaticPageLayout.tsx
import styles from "./StaticPageLayout.module.css";

import type { ReactNode } from "react";


type StaticPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export const StaticPageLayout = ({
  title,
  children,
}: StaticPageLayoutProps) => {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
};