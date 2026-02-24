// src/pages/login/ui/LoginPage.tsx
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import styles from './LoginPage.module.css';
import { authService } from '@/features/auth/model/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login({ email, password });
      const from = (location.state as any)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка входа');
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

        <h1 className={styles.title}>Войти</h1>

        <div className={styles.card}>
          <div className={styles.socialSection}>
            <button className={styles.vkButton} type="button">
              Продолжить через ВК
            </button>
          </div>

          <div className={styles.divider}>
            <span>или</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <Link to="/forgot-password" className={styles.forgotLink}>
              Забыли пароль?
            </Link>

            {error && (
              <div style={{ color: '#dc2626', fontSize: '0.95rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Входим...' : 'Продолжить'}
            </button>
          </form>

          <div className={styles.registerSection}>
            <p className={styles.registerText}>У вас еще нет аккаунта?</p>
            <Link to="/register" className={styles.registerLink}>
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;