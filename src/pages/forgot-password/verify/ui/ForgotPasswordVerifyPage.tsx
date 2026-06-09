// /src/pages/forgot-password/verify/ui/ForgotPasswordVerifyPage.tsx
import { useEffect, useState, type FormEvent, type ReactElement } from 'react';

import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';
import { usePasswordRecoveryFlow } from '@/features/auth/model/usePasswordRecoveryFlow';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../ForgotPassword.module.css';

export function ForgotPasswordVerifyPage(): ReactElement {
  const navigate = useAppNavigate();
  const flow = usePasswordRecoveryFlow();

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!flow.email || !flow.isStarted) {
      navigate('/forgot-password', { replace: true });
    }
  }, [flow.email, flow.isStarted, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setError('Введите код подтверждения.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await passwordRecoveryService.verifyCode(normalizedCode);
      navigate('/forgot-password/reset', { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Не удалось подтвердить код.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestartClick = (): void => {
    if (!flow.email) {
      return;
    }

    void passwordRecoveryService.sendCode(flow.email);
  };

  return (
    <section className={styles.page}>
      <div className={styles.background} aria-hidden="true" />
      <button
        className={styles.backButton}
        type="button"
        onClick={() => navigate('/forgot-password')}
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
                  <h1 className={styles.title}>Восстановление пароля</h1>
                  <p className={styles.text}>
                    Введите код, отправленный на email <b>{flow.email}</b>
                  </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      type="text"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="Введите код"
                      autoComplete="one-time-code"
                      disabled={submitting}
                      required
                    />
                  </label>

                  {error ? <p className={styles.error}>{error}</p> : null}

                  <button
                    className={styles.secondaryInlineButton}
                    type="button"
                    onClick={handleRestartClick}
                  >
                    Отправить код ещё раз
                  </button>

                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Проверяем...' : 'Подтвердить код'}
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
