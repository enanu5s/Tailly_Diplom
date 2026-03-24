// src/features/admin-password-recovery-management/ui/AdminPasswordRecoveryManagementSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import styles from './AdminPasswordRecoveryManagementSection.module.css';
import { adminPasswordRecoveryManagementStore } from '../model/adminPasswordRecoveryManagementStore';

import type { ReactElement } from 'react';

function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

async function copyToClipboard(value: string): Promise<boolean> {
  if (!value.trim()) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export const AdminPasswordRecoveryManagementSection = observer((): ReactElement => {
  const store = adminPasswordRecoveryManagementStore;
  const [copiedRequestId, setCopiedRequestId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState('');

  useEffect(() => {
    void store.load();
  }, [store]);

  const handleCopyPassword = async (
    requestId: string,
    password?: string,
  ): Promise<void> => {
    setCopyError('');
    setCopiedRequestId(null);

    if (!password) {
      setCopyError('Пароль для этой заявки недоступен.');
      return;
    }

    const copied = await copyToClipboard(password);

    if (!copied) {
      setCopyError('Не удалось скопировать пароль.');
      return;
    }

    setCopiedRequestId(requestId);

    window.setTimeout(() => {
      setCopiedRequestId((currentValue) =>
        currentValue === requestId ? null : currentValue,
      );
    }, 2000);
  };

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Только для главного администратора</span>

          <h1 className={styles.title}>
            Заявки на восстановление паролей администраторов
          </h1>

          <p className={styles.subtitle}>
            Здесь отображаются заявки на восстановление пароля для администраторов и
            главного администратора. После обработки генерируется временный пароль и
            обновляется mock-аккаунт администратора.
          </p>
        </div>
      </div>

      {store.processError ? (
        <div className={styles.errorBanner}>{store.processError}</div>
      ) : null}

      {copyError ? <div className={styles.errorBanner}>{copyError}</div> : null}

      {store.lastGeneratedPassword ? (
        <div className={styles.successBanner}>
          Для {store.lastProcessedRequestEmail} сгенерирован временный пароль:{' '}
          <span className={styles.passwordValue}>{store.lastGeneratedPassword}</span>.
          Теперь этот пароль можно использовать для входа в mock-режиме.
        </div>
      ) : null}

      {store.isLoading ? (
        <div className={styles.stateCard}>Загрузка заявок...</div>
      ) : null}

      {!store.isLoading && store.loadError ? (
        <div className={styles.errorBanner}>{store.loadError}</div>
      ) : null}

      {!store.isLoading && !store.loadError ? (
        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Новые заявки</h2>
              <span className={styles.counter}>{store.pendingRequests.length}</span>
            </div>

            {store.pendingRequests.length === 0 ? (
              <div className={styles.emptyCard}>Пока нет новых заявок.</div>
            ) : (
              <div className={styles.grid}>
                {store.pendingRequests.map((item) => (
                  <article key={item.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div>
                        <div className={styles.cardTitle}>{item.email}</div>
                        <div className={styles.cardMeta}>
                          Запрошено: {formatDate(item.requestedAt)}
                        </div>
                      </div>

                      <span className={styles.pendingBadge}>Ожидает</span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.primaryButton}
                        type="button"
                        disabled={store.processingRequestId === item.id}
                        onClick={() => {
                          void store.processRequest(item.id);
                        }}
                      >
                        {store.processingRequestId === item.id
                          ? 'Генерация...'
                          : 'Сгенерировать пароль'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Обработанные заявки</h2>
              <span className={styles.counter}>{store.processedRequests.length}</span>
            </div>

            {store.processedRequests.length === 0 ? (
              <div className={styles.emptyCard}>Обработанных заявок пока нет.</div>
            ) : (
              <div className={styles.grid}>
                {store.processedRequests.map((item) => (
                  <article key={item.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div>
                        <div className={styles.cardTitle}>{item.email}</div>
                        <div className={styles.cardMeta}>
                          Запрошено: {formatDate(item.requestedAt)}
                        </div>
                        <div className={styles.cardMeta}>
                          Обработано: {formatDate(item.processedAt)}
                        </div>
                      </div>

                      <span className={styles.processedBadge}>Обработано</span>
                    </div>

                    <div className={styles.passwordBlock}>
                      <span className={styles.passwordLabel}>
                        Последний временный пароль
                      </span>

                      <div className={styles.passwordRow}>
                        <span className={styles.passwordValueInline}>
                          {item.temporaryPassword || '—'}
                        </span>

                        <button
                          className={styles.secondaryButton}
                          type="button"
                          disabled={!item.temporaryPassword}
                          onClick={() => {
                            void handleCopyPassword(item.id, item.temporaryPassword);
                          }}
                        >
                          {copiedRequestId === item.id
                            ? 'Скопировано'
                            : 'Скопировать пароль'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
});
