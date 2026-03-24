// src/pages/account-restore/ui/RestoreAccountPage.tsx

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  AccountDeletionError,
  accountDeletionService,
} from '@/features/account-deletion';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './RestoreAccountPage.module.css';

function formatRuDeadline(iso: string): string {
  const time = new Date(iso).getTime();

  if (Number.isNaN(time)) {
    return iso;
  }

  return new Date(iso).toLocaleString('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

export function RestoreAccountPage() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useAppNavigate();

  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    email: string;
    roleLabel: string;
    displayName: string;
    restoreDeadlineIso: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await accountDeletionService.getRestorePreview(
          decodeURIComponent(token),
        );

        if (!cancelled) {
          setPreview(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setPreview(null);
          setError(
            loadError instanceof AccountDeletionError
              ? loadError.message
              : 'Не удалось загрузить данные.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleRestore = async (): Promise<void> => {
    setRestoring(true);
    setError(null);

    try {
      await accountDeletionService.restoreByToken(decodeURIComponent(token));
      navigate('/login?accountRestored=1', { replace: true });
    } catch (restoreError) {
      setError(
        restoreError instanceof AccountDeletionError
          ? restoreError.message
          : 'Не удалось восстановить аккаунт.',
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.backLink} to="/">
          ← На главную
        </Link>

        <h1 className={styles.h1}>Восстановление аккаунта</h1>

        <div className={styles.card}>
          {loading ? (
            <div className={styles.state}>Загрузка...</div>
          ) : null}

          {!loading && error && !preview ? (
            <div className={styles.error}>{error}</div>
          ) : null}

          {!loading && preview ? (
            <>
              <p className={styles.lead}>
                Восстановить доступ можно до{' '}
                <strong>{formatRuDeadline(preview.restoreDeadlineIso)}</strong>.
              </p>

              <ul className={styles.summary}>
                <li>
                  <span className={styles.summaryLabel}>Имя</span>
                  <span className={styles.summaryValue}>
                    {preview.displayName}
                  </span>
                </li>
                <li>
                  <span className={styles.summaryLabel}>Почта</span>
                  <span className={styles.summaryValue}>{preview.email}</span>
                </li>
                <li>
                  <span className={styles.summaryLabel}>Тип аккаунта</span>
                  <span className={styles.summaryValue}>
                    {preview.roleLabel}
                  </span>
                </li>
              </ul>

              {error ? <div className={styles.error}>{error}</div> : null}

              <button
                className={styles.primaryBtn}
                type="button"
                disabled={restoring}
                onClick={() => void handleRestore()}
              >
                {restoring ? 'Восстанавливаем...' : 'Восстановить аккаунт'}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
