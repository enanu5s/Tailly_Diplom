//src/pages/register-client/step1/ui/RegisterClientStep1Page.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../RegisterClient.module.css';
import { registerService } from '@/features/auth/model/registerService';

export const RegisterClientStep1Page = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [consent, setConsent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await registerService.start(email, password);
      navigate('/register/client/verify');
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Вернуться назад
        </button>

        <h1 className={styles.title}>Регистрация клиента</h1>
        <p className={styles.subtitle}>Шаг 1 из 3 — создайте аккаунт</p>

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

            <input
              className={styles.input}
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              className={styles.input}
              type="password"
              placeholder="Повторите пароль"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.consentRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <div className={styles.consentText}>
                Я согласен(на) с{' '}
                <a href="/docs/personal-data-agreement.pdf" download>
                  пользовательским соглашением об обработке данных
                </a>
              </div>
            </div>

            <button className={styles.submitButton} disabled={loading || !consent} type="submit">
              {loading ? 'Отправляем код...' : 'Продолжить'}
            </button>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  registerService.resetFlow();
                  setEmail('');
                  setPassword('');
                  setPassword2('');
                }}
              >
                Очистить
              </button>

              <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                (в мок-режиме код: 123456)
              </span>
            </div>

            <div className={styles.loginHint}>
              У вас уже есть аккаунт? <a href="/login">Войти</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};