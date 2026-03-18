// src/pages/messages/ui/MessagesPage.tsx
import type { ReactElement } from 'react';
import { MessagesSection } from '@/features/messages';
import styles from './MessagesPage.module.css';

export const MessagesPage = (): ReactElement => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <MessagesSection />
      </div>
    </div>
  );
};