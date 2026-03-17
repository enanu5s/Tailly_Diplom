// src/pages/login/ui/LoginPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { authStore, loginStore } from '@/features/auth';
import { getDefaultAuthorizedRoute } from '@/shared/lib/auth';

import styles from './LoginPage.module.css';

import type { FormEvent, ReactElement } from 'react';

type LocationState = {
  from?: string;
};

export const LoginPage = observer((): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
  );

  const state = (location.state ?? null) as LocationState | null;

  useEffect(() => {
    if (authState.user) {
      navigate(getDefaultAuthorizedRoute(authState.user), {
        replace: true,
      });
    }
  }, [authState.user, navigate]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const success = await loginStore.submit();

    if (!success) {
      return;
    }

    const nextUser = authStore.getState().user;
    const redirectPath =
      state?.from ?? getDefaultAuthorizedRoute(nextUser);

    navigate(redirectPath, { replace: true });
  };

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <button
          className={styles.backButton}
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Назад
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.badge}>Tailly</span>

            <h1 className={styles.title}>Вход в аккаунт</h1>

            <p className={styles.subtitle}>
              Клиенты, специалисты и администраторы входят через
              единую форму авторизации.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>

              <input
                className={styles.input}
                type="email"
                value={loginStore.email}
                onChange={(event) =>
                  loginStore.setEmail(event.target.value)
                }
                placeholder="name@example.com"
                autoComplete="username"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Пароль</span>

              <input
                className={styles.input}
                type="password"
                value={loginStore.password}
                onChange={(event) =>
                  loginStore.setPassword(event.target.value)
                }
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
            </label>


            {loginStore.failedAttemptsLeft !== null &&
              loginStore.failedAttemptsLeft > 0 ? (
              <div className={styles.attempts}>
                Осталось попыток для администратора:{' '}
                {loginStore.failedAttemptsLeft}
              </div>
            ) : null}

            {loginStore.submitError ? (
              <div className={styles.error}>
                {loginStore.submitError}
              </div>
            ) : null}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={!loginStore.canSubmit}
            >
              {loginStore.isSubmitting
                ? 'Выполняется вход...'
                : 'Войти'}
            </button>

            <div className={styles.links}>
              <button
                className={styles.linkButton}
                type="button"
                onClick={() => navigate('/forgot-password')}
              >
                Восстановить пароль
              </button>

              <Link
                className={styles.linkButton}
                to="/register"
              >
                Регистрация
              </Link>
            </div>
          </form>

          <div className={styles.demoBlock}>
            <div className={styles.demoTitle}>
              Тестовые аккаунты
            </div>

            <div className={styles.demoList}>
              <div className={styles.demoItem}>
                client@tailly.local / 123456
              </div>

              <div className={styles.demoItem}>
                specialist@tailly.local / 123456
              </div>

              <div className={styles.demoItem}>
                admin@tailly.local / 123456
              </div>

              <div className={styles.demoItem}>
                superadmin@tailly.local / 123456
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});