// /src/pages/forgot-password/email/ui/ForgotPasswordEmailPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';

import styles from '../../ForgotPassword.module.css';

export function ForgotPasswordEmailPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Введите email.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await passwordRecoveryService.sendCode(normalizedEmail);
      navigate('/forgot-password/verify', { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Не удалось отправить код восстановления.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    passwordRecoveryService.resetFlow();
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Восстановление пароля</h1>
      <p className={styles.text}>
        Введите email, который привязан к вашему аккаунту. Мы отправим код для
        восстановления пароля.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@mail.com"
            autoComplete="email"
            disabled={submitting}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.primaryButton} type="submit" disabled={submitting}>
          {submitting ? 'Отправляем...' : 'Отправить код'}
        </button>
      </form>

      <Link className={styles.secondaryLink} to="/login" onClick={handleBackClick}>
        Вернуться ко входу
      </Link>
    </div>
  );
}