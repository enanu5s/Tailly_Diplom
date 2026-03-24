// /src/pages/forgot-password/reset/ui/ForgotPasswordResetPage.tsx
import { useEffect, useState } from 'react';


import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';
import { usePasswordRecoveryFlow } from '@/features/auth/model/usePasswordRecoveryFlow';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../ForgotPassword.module.css';

export function ForgotPasswordResetPage() {
  const navigate = useAppNavigate();
  const flow = usePasswordRecoveryFlow();

  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!flow.email || !flow.code || !flow.isVerified) {
      navigate('/forgot-password', { replace: true });
    }
  }, [flow.email, flow.code, flow.isVerified, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPassword = password.trim();
    const normalizedPasswordRepeat = passwordRepeat.trim();

    if (!normalizedPassword || !normalizedPasswordRepeat) {
      setError('Заполните оба поля пароля.');
      return;
    }

    if (normalizedPassword !== normalizedPasswordRepeat) {
      setError('Пароли не совпадают.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await passwordRecoveryService.resetPassword(normalizedPassword);
      navigate('/login', { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Не удалось сбросить пароль.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Новый пароль</h1>
      <p className={styles.text}>Введите новый пароль для вашего аккаунта.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Новый пароль
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите новый пароль"
            autoComplete="new-password"
            disabled={submitting}
          />
        </label>

        <label className={styles.label}>
          Повторите пароль
          <input
            className={styles.input}
            type="password"
            value={passwordRepeat}
            onChange={(event) => setPasswordRepeat(event.target.value)}
            placeholder="Повторите новый пароль"
            autoComplete="new-password"
            disabled={submitting}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.primaryButton} type="submit" disabled={submitting}>
          {submitting ? 'Сохраняем...' : 'Сохранить пароль'}
        </button>
      </form>
    </div>
  );
}