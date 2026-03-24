// /src/pages/forgot-password/verify/ui/ForgotPasswordVerifyPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';
import { usePasswordRecoveryFlow } from '@/features/auth/model/usePasswordRecoveryFlow';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../ForgotPassword.module.css';

export function ForgotPasswordVerifyPage() {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleBackClick = () => {
    passwordRecoveryService.resetFlow();
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Подтверждение кода</h1>
      <p className={styles.text}>
        Введите код, отправленный на email {flow.email || 'ваш адрес'}.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Код подтверждения
          <input
            className={styles.input}
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Введите код"
            autoComplete="one-time-code"
            disabled={submitting}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.primaryButton} type="submit" disabled={submitting}>
          {submitting ? 'Проверяем...' : 'Подтвердить код'}
        </button>
      </form>

      <Link
        className={styles.secondaryLink}
        to="/forgot-password"
        onClick={handleBackClick}
      >
        Начать заново
      </Link>
    </div>
  );
}
