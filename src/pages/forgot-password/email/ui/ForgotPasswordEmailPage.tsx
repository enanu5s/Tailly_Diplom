// src/pages/forgot-password/email/ui/ForgotPasswordEmailPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../ForgotPassword.module.css';

export function ForgotPasswordEmailPage() {
  const navigate = useAppNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdminRequestCreated, setIsAdminRequestCreated] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleBackClick = () => {
    passwordRecoveryService.resetFlow();
    setError('');
    setSuccess('');
    setIsAdminRequestCreated(false);
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Восстановление пароля</h1>

      <p className={styles.text}>
        Введите email, который привязан к вашему аккаунту. Для клиентов и специалистов
        будет отправлен код подтверждения. Для администратора будет создана заявка на
        восстановление пароля.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>

          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@mail.com"
            autoComplete="email"
            disabled={submitting || isAdminRequestCreated}
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
              : 'Продолжить'}
        </button>
      </form>

      <Link className={styles.linkButton} to="/login" onClick={handleBackClick}>
        Вернуться ко входу
      </Link>
    </div>
  );
}
