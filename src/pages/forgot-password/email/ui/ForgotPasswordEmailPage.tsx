// src/pages/forgot-password/email/ui/ForgotPasswordEmailPage.tsx

import { useState, type FormEvent, type ReactElement } from 'react';

import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../ForgotPassword.module.css';

export function ForgotPasswordEmailPage(): ReactElement {
  const navigate = useAppNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdminRequestCreated, setIsAdminRequestCreated] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (submitting || isAdminRequestCreated) {
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Введите email.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const result = await passwordRecoveryService.startRecovery(normalizedEmail);

      if (result.flow === 'default') {
        navigate('/forgot-password/verify', { replace: true });
        return;
      }

      setIsAdminRequestCreated(true);
      setSuccess(
        'Запрос на восстановление отправлен главному администратору. Новый пароль будет направлен на корпоративную почту после обработки заявки.',
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Не удалось начать восстановление пароля.',
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
        onClick={() => navigate('/login')}
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
                    Введите email, который привязан к вашему аккаунту
                  </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="tailly@mail.com"
                      autoComplete="email"
                      disabled={submitting || isAdminRequestCreated}
                      required
                    />
                  </label>

                  {error ? <p className={styles.error}>{error}</p> : null}
                  {success ? <p className={styles.success}>{success}</p> : null}

                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={submitting || isAdminRequestCreated}
                  >
                    {submitting
                      ? 'Продолжаем...'
                      : isAdminRequestCreated
                        ? 'Заявка отправлена'
                        : 'Подтвердить'}
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
