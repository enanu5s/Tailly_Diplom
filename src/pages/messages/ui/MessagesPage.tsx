// src/pages/messages/ui/MessagesPage.tsx
import { useState, type ReactElement } from 'react';

import { MessagesSection } from '@/features/messages';

import styles from './MessagesPage.module.css';

export const MessagesPage = (): ReactElement => {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  return (
    <div
      className={[styles.page, isMobileChatOpen ? styles.pageChatOpen : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.container}>
        <h1
          className={[styles.title, isMobileChatOpen ? styles.titleHidden : '']
            .filter(Boolean)
            .join(' ')}
        >
          Сообщения
        </h1>
        <MessagesSection onMobileChatViewChange={setIsMobileChatOpen} />
      </div>
    </div>
  );
};
