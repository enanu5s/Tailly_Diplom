// /src/pages/forgot-password/reset/ui/ForgotPasswordResetPage.tsx
import { useEffect, useState, type FormEvent, type ReactElement } from 'react';

import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';
import { usePasswordRecoveryFlow } from '@/features/auth/model/usePasswordRecoveryFlow';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../ForgotPassword.module.css';

export function ForgotPasswordResetPage(): ReactElement {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
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
    <section className={styles.page}>
      <div className={styles.background} aria-hidden="true" />
      <button
        className={styles.backButton}
        type="button"
        onClick={() => navigate('/forgot-password/verify')}
      >
        <span className={styles.backIcon}>←</span>
        <span>Назад</span>
      </button>
      <div className={styles.layout}>
        <div className={styles.stack}>
          <div className={styles.cardWrap}>
            <span className={styles.backgroundBlobLeft} aria-hidden="true" />
            <span className={styles.backgroundBlobRight} aria-hidden="true" />

            <div className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.header}>
                  <h1 className={styles.title}>Новый пароль</h1>
                  <p className={styles.text}>Введите новый пароль для вашего аккаунта</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Введите новый пароль"
                      autoComplete="new-password"
                      disabled={submitting}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      type="password"
                      value={passwordRepeat}
                      onChange={(event) => setPasswordRepeat(event.target.value)}
                      placeholder="Повторите новый пароль"
                      autoComplete="new-password"
                      disabled={submitting}
                      required
                    />
                  </label>

                  {error ? <p className={styles.error}>{error}</p> : null}

                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Сохраняем...' : 'Сохранить пароль'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
