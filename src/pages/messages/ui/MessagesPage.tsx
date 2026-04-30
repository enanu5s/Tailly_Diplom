// src/pages/messages/ui/MessagesPage.tsx
import { MessagesSection } from '@/features/messages';

import styles from './MessagesPage.module.css';

import type { ReactElement } from 'react';

export const MessagesPage = (): ReactElement => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Сообщения</h1>
        <MessagesSection />
      </div>
    </div>
  );
};
