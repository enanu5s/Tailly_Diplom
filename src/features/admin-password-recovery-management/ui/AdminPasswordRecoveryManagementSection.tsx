// src/features/admin-password-recovery-management/ui/AdminPasswordRecoveryManagementSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function getOptionalStringField(value: unknown, fieldName: string): string | undefined {
  if (typeof value !== 'object' || value === null || !(fieldName in value)) {
    return undefined;
  }

  const fieldValue = (value as Record<string, unknown>)[fieldName];

  return typeof fieldValue === 'string' && fieldValue.trim()
    ? fieldValue
    : undefined;
}

function getRequestName(value: unknown, email: string): string {
  return (
    getOptionalStringField(value, 'fullName') ??
    getOptionalStringField(value, 'name') ??
    getOptionalStringField(value, 'adminName') ??
    email
  );
}

function getRequestDepartment(value: unknown): string {
  return (
    getOptionalStringField(value, 'department') ??
    getOptionalStringField(value, 'roleLabel') ??
    'Поддержка'
  );
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
  const navigate = useNavigate();

  const [copiedRequestId, setCopiedRequestId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState('');

  useEffect(() => {
    void store.load();
  }, [store]);

  useEffect(() => {
    if (!store.lastGeneratedPassword) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      store.clearSuccessMessage();
    }, 7000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [store, store.lastGeneratedPassword]);

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
      <button
        className={styles.backButton}
        type="button"
        onClick={() => {
          navigate(-1);
        }}
      >
        <span className={styles.backIcon}>←</span>
        Назад
      </button>

      <h1 className={styles.title}>
        Заявки на восстановление паролей администраторов
      </h1>

      {store.processError ? (
        <div className={styles.errorBanner}>{store.processError}</div>
      ) : null}

      {copyError ? <div className={styles.errorBanner}>{copyError}</div> : null}

      {store.lastGeneratedPassword ? (
        <div className={styles.successBanner}>
          Для {store.lastProcessedRequestEmail} сгенерирован временный пароль:{' '}
          <span className={styles.passwordValue}>{store.lastGeneratedPassword}</span>.
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
            <h2 className={styles.sectionTitle}>
              Новые заявки: {store.pendingRequests.length}
            </h2>

            {store.pendingRequests.length === 0 ? (
              <div className={styles.emptyCard}>
                Пока нет новых заявок на восстановление паролей
              </div>
            ) : (
              <div className={styles.pendingList}>
                {store.pendingRequests.map((item) => (
                  <article key={item.id} className={styles.pendingCard}>
                    <div className={styles.department}>
                      Отдел: {getRequestDepartment(item)}
                    </div>

                    <span className={styles.pendingBadge}>Ожидает</span>

                    <div className={styles.cardMainRow}>
                      <h3 className={styles.cardTitle}>
                        {getRequestName(item, '—')}
                      </h3>

                      <span className={styles.cardEmail}>{item.email}</span>
                    </div>

                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Запрошено:</span>
                      <span className={styles.metaValue}>
                        {formatDate(item.requestedAt)}
                      </span>
                    </div>

                    <div className={styles.pendingActions}>
                      <button className={styles.dangerButton} type="button" disabled>
                        Отклонить
                      </button>

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
            <h2 className={styles.sectionTitle}>
              Обработанные заявки: {store.processedRequests.length}
            </h2>

            {store.processedRequests.length === 0 ? (
              <div className={styles.emptyCard}>Обработанных заявок пока нет.</div>
            ) : (
              <div className={styles.processedGrid}>
                {store.processedRequests.map((item) => (
                  <article key={item.id} className={styles.processedCard}>
                    <div className={styles.department}>
                      Отдел: {getRequestDepartment(item)}
                    </div>

                    <span className={styles.processedBadge}>Обработано</span>

                    <div className={styles.cardMainRow}>
                      <h3 className={styles.cardTitle}>
                        {getRequestName(item, item.email)}
                      </h3>

                      <span className={styles.cardEmail}>{item.email}</span>
                    </div>

                    <div className={styles.metaStack}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Запрошено:</span>
                        <span className={styles.metaValue}>
                          {formatDate(item.requestedAt)}
                        </span>
                      </div>

                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Обработано:</span>
                        <span className={styles.metaValue}>
                          {formatDate(item.processedAt)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.passwordBlock}>
                      <div>
                        <span className={styles.passwordLabel}>
                          Последний временный пароль
                        </span>

                        <span className={styles.passwordValueInline}>
                          {item.temporaryPassword || '—'}
                        </span>
                      </div>

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