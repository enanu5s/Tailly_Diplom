// src/pages/account-delete/ui/DeleteAccountPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AccountDeletionError,
  accountDeletionService,
} from '@/features/account-deletion';
import { authStore } from '@/features/auth/model/authStore';
import { useAuth } from '@/features/auth/model/useAuth';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './DeleteAccountPage.module.css';

export function DeleteAccountPage() {
  const navigate = useAppNavigate();
  const { user } = useAuth();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backHref =
    user?.role === 'specialist' && user.specialistSlug?.trim()
      ? `/specialists/${user.specialistSlug.trim()}`
      : '/profile';

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!user?.id) {
      setError('Не удалось определить учётную запись.');
      return;
    }

    setLoading(true);

    try {
      await accountDeletionService.requestDeletion({
        userId: user.id,
        password: password.trim(),
      });

      authStore.logout();
      navigate('/login?accountDeletion=scheduled', { replace: true });
    } catch (submissionError) {
      const message =
        submissionError instanceof AccountDeletionError
          ? submissionError.message
          : submissionError instanceof Error
            ? submissionError.message
            : 'Не удалось запланировать удаление.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.backLink} to={backHref}>
          ← Назад
        </Link>

        <h1 className={styles.h1}>Удаление аккаунта</h1>

        <div className={styles.card}>
          <p className={styles.lead}>
            Аккаунт будет заблокирован для входа. В течение 30 дней его можно
            восстановить по ссылке из письма на вашу почту. По истечении срока
            данные удаляются безвозвратно.
          </p>

          {error ? <div className={styles.error}>{error}</div> : null}

          <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
            <label className={styles.field}>
              <span className={styles.label}>Текущий пароль</span>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <div className={styles.actions}>
              <button
                className={styles.dangerBtn}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Обработка...' : 'Запланировать удаление аккаунта'}
              </button>

              <Link className={styles.secondaryBtn} to={backHref}>
                Отмена
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
