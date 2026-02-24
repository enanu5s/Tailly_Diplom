// src/pages/login/ui/LoginPage.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика авторизации (пока заглушка)
    console.log('Вход:', { email, password });
    // navigate('/profile'); // потом раскомментируете
  };

  return (
    <>

      <div className={styles.page}>
        <div className={styles.container}>
          {/* Кнопка назад */}
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            ← Вернуться назад
          </button>

          <h1 className={styles.title}>Войти</h1>

          {/* Основная карточка */}
          <div className={styles.card}>
            {/* Часть 1 — Социальная авторизация */}
            <div className={styles.socialSection}>
              <button className={styles.vkButton}>
                Продолжить через ВК
              </button>
            </div>

            <div className={styles.divider}>
              <span>или</span>
            </div>

            {/* Часть 2 — Форма */}
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

              <button type="submit" className={styles.submitButton}>
                Продолжить
              </button>
            </form>

            {/* Часть 3 — Регистрация */}
            <div className={styles.registerSection}>
              <p className={styles.registerText}>
                У вас еще нет аккаунта?
              </p>
              <Link to="/register" className={styles.registerLink}>
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default LoginPage;