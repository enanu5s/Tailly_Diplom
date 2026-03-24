// src/pages/login/ui/LoginPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Link, useLocation, useSearchParams, type Location } from 'react-router-dom';

import { authStore, loginStore } from '@/features/auth';
import { getDefaultAuthorizedRoute } from '@/shared/lib/auth';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './LoginPage.module.css';

import type { FormEvent, ReactElement } from 'react';

/**
 * Куда увести после входа: `?from=` (надёжно при потере state), строка `state.from`,
 * либо объект (как в ShopPurchaseRouteGuard: `state={{ from: location }}`).
 */
function resolvePostLoginRedirect(location: Location): string | null {
  const fromQuery = getRedirectFromQuery(location.search);

  if (fromQuery) {
    return fromQuery;
  }

  const raw = location.state;

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = (raw as { from?: unknown }).from;

  if (typeof candidate === 'string' && candidate.trim().startsWith('/')) {
    return candidate.trim();
  }

  if (candidate && typeof candidate === 'object' && 'pathname' in candidate) {
    const loc = candidate as { pathname?: string; search?: string; hash?: string };

    if (typeof loc.pathname === 'string' && loc.pathname.startsWith('/')) {
      return `${loc.pathname}${loc.search ?? ''}${loc.hash ?? ''}`;
    }
  }

  return null;
}

function getRedirectFromQuery(search: string): string | null {
  const searchParams = new URLSearchParams(search);
  const from = searchParams.get('from');

  if (!from) {
    return null;
  }

  const normalizedFrom = from.trim();

  if (!normalizedFrom.startsWith('/')) {
    return null;
  }

  return normalizedFrom;
}

export const LoginPage = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const authState = useSyncExternalStore(authStore.subscribe, authStore.getState);

  const accountFlowNotice = useMemo(() => {
    if (searchParams.get('accountDeletion') === 'scheduled') {
      return 'Аккаунт запланирован к удалению. Проверьте почту: там ссылка для восстановления до указанной даты.';
    }

    if (searchParams.get('accountRestored') === '1') {
      return 'Аккаунт восстановлен. Вы можете войти с прежним паролем.';
    }

    return null;
  }, [searchParams]);

  /**
   * Если пользователь уже вошёл и открыл /login (или только что вошёл — MobX обновился до конца submit),
   * уводим с формы входа. Сначала учитываем `state.from` / `?from=` (например возврат в корзину после входа),
   * иначе редирект на профиль перезапишет нужный маршрут.
   */
  useEffect(() => {
    if (!authState.user) {
      return;
    }

    const redirectTarget = resolvePostLoginRedirect(location);

    if (redirectTarget) {
      navigate(redirectTarget, { replace: true, preserveRouteMemory: false });
      return;
    }

    navigate(getDefaultAuthorizedRoute(authState.user), {
      replace: true,
      preserveRouteMemory: false,
    });
  }, [authState.user, navigate, location]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const success = await loginStore.submit();

    if (!success) {
      return;
    }

    const nextUser = authStore.getState().user;
    const wasLogout = sessionStorage.getItem('tailly_logged_out') === '1';

    if (wasLogout) {
      sessionStorage.removeItem('tailly_logged_out');

      navigate(getDefaultAuthorizedRoute(nextUser), {
        replace: true,
        preserveRouteMemory: false,
      });

      return;
    }

    const redirectTarget = resolvePostLoginRedirect(location);

    if (redirectTarget) {
      navigate(redirectTarget, { replace: true, preserveRouteMemory: false });
      return;
    }

    navigate(getDefaultAuthorizedRoute(nextUser!), {
      replace: true,
      preserveRouteMemory: false,
    });
  };

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backButton} type="button" onClick={() => navigate('/')}>
          ← Назад
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.badge}>Tailly</span>

            <h1 className={styles.title}>Вход в аккаунт</h1>

            <p className={styles.subtitle}>
              Клиенты, специалисты и администраторы входят через единую форму авторизации.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>

              <input
                className={styles.input}
                type="email"
                value={loginStore.email}
                onChange={(event) => loginStore.setEmail(event.target.value)}
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
                onChange={(event) => loginStore.setPassword(event.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
            </label>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={loginStore.loginAsSpecialist}
                onChange={(event) =>
                  loginStore.setLoginAsSpecialist(event.target.checked)
                }
              />
              <span>Войти как специалист</span>
            </label>

            {loginStore.failedAttemptsLeft !== null &&
            loginStore.failedAttemptsLeft > 0 ? (
              <div className={styles.attempts}>
                Осталось попыток для администратора: {loginStore.failedAttemptsLeft}
              </div>
            ) : null}

            {accountFlowNotice ? (
              <div className={styles.infoBanner}>{accountFlowNotice}</div>
            ) : null}

            {loginStore.submitError ? (
              <div className={styles.error}>{loginStore.submitError}</div>
            ) : null}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={!loginStore.canSubmit}
            >
              {loginStore.isSubmitting ? 'Выполняется вход...' : 'Войти'}
            </button>

            <div className={styles.links}>
              <button
                className={styles.linkButton}
                type="button"
                onClick={() => navigate('/forgot-password')}
              >
                Восстановить пароль
              </button>

              <Link className={styles.linkButton} to="/register">
                Регистрация
              </Link>
            </div>
          </form>

          <div className={styles.demoBlock}>
            <div className={styles.demoTitle}>Тестовые аккаунты</div>

            <div className={styles.demoList}>
              <div className={styles.demoItem}>client@tailly.local / 123456</div>

              <div className={styles.demoItem}>specialist@tailly.local / 123456</div>

              <div className={styles.demoItem}>admin@tailly.local / 123456</div>

              <div className={styles.demoItem}>superadmin@tailly.local / 123456</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
