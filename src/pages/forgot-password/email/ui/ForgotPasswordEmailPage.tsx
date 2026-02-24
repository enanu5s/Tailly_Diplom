//src/pages/forgot-password/email/ui/ForgotPasswordEmailPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../ForgotPassword.module.css';
import { passwordRecoveryService } from '@/features/auth/model/passwordRecoveryService';

export const ForgotPasswordEmailPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await passwordRecoveryService.start(email);
      navigate('/forgot-password/verify');
    } catch (e: any) {
      setError(e?.message ?? 'Не удалось отправить код');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Назад
        </button>

        <h1 className={styles.title}>Восстановление пароля</h1>
        <p className={styles.subtitle}>Шаг 1 из 3 — укажите почту</p>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.submitButton} disabled={loading} type="submit">
              {loading ? 'Отправляем...' : 'Отправить код'}
            </button>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setEmail('');
                  passwordRecoveryService.resetFlow();
                }}
              >
                Очистить
              </button>

              <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                (в мок-режиме код: 123456)
              </span>
            </div>

            <div className={styles.hint}>
              Вспомнили пароль? <Link to="/login">Войти</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};