// src/pages/admin-forgot-password/ui/AdminForgotPasswordPage.tsx
import { observer } from 'mobx-react-lite';

import { adminPasswordRecoveryStore } from '@/features/admin-password-recovery/model/adminPasswordRecoveryStore';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './AdminForgotPasswordPage.module.css';

import type { ReactElement, FormEvent } from 'react';

export const AdminForgotPasswordPage = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const store = adminPasswordRecoveryStore;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await store.submit();
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Восстановление пароля администратора</h1>

        {!store.isSuccess ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="email"
              value={store.email}
              onChange={(e) => store.setEmail(e.target.value)}
              placeholder="Введите email администратора"
              required
            />

            {store.submitError && <div className={styles.error}>{store.submitError}</div>}

            <button type="submit" disabled={!store.canSubmit} className={styles.button}>
              {store.isSubmitting ? 'Отправляем...' : 'Отправить запрос'}
            </button>
          </form>
        ) : (
          <div className={styles.success}>Запрос отправлен главному администратору.</div>
        )}

        <button className={styles.back} onClick={() => navigate('/login')}>
          Назад
        </button>
      </div>
    </section>
  );
});
