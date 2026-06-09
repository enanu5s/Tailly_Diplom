// src/pages/login/ui/LoginPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useSearchParams, type Location } from 'react-router-dom';

import { authStore, loginStore } from '@/features/auth';
import { isMockApiMode } from '@/shared/config/env';
import {
  getMockUnifiedLoginDemoRows,
  type MockDemoCredentialRow,
} from '@/shared/config/mockDemoCredentials';
import { getDefaultAuthorizedRoute } from '@/shared/lib/auth';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { subscribeMockDatabase } from '@/shared/mock-db/store';

import styles from './LoginPage.module.css';

import type { FormEvent, ReactElement } from 'react';

function normalizeCheckoutRedirect(target: string): string {
  // Checkout is protected for guests. After login we return user to cart
  // so they can confirm merge result and continue ordering predictably.
  if (target === '/shop/checkout' || target.startsWith('/shop/checkout?')) {
    return '/shop/cart';
  }

  return target;
}

function resolvePostLoginRedirect(location: Location): string | null {
  const fromQuery = getRedirectFromQuery(location.search);

  if (fromQuery) {
    return normalizeCheckoutRedirect(fromQuery);
  }

  const raw = location.state;

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = (raw as { from?: unknown }).from;

  if (typeof candidate === 'string' && candidate.trim().startsWith('/')) {
    return normalizeCheckoutRedirect(candidate.trim());
  }

  if (candidate && typeof candidate === 'object' && 'pathname' in candidate) {
    const loc = candidate as { pathname?: string; search?: string; hash?: string };

    if (typeof loc.pathname === 'string' && loc.pathname.startsWith('/')) {
      return normalizeCheckoutRedirect(
        `${loc.pathname}${loc.search ?? ''}${loc.hash ?? ''}`,
      );
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

  const [mockDemoRows, setMockDemoRows] = useState<MockDemoCredentialRow[]>(() =>
    getMockUnifiedLoginDemoRows(),
  );

  useEffect(() => {
    return subscribeMockDatabase(() => {
      setMockDemoRows(getMockUnifiedLoginDemoRows());
    });
  }, []);

  const accountFlowNotice = useMemo(() => {
    if (searchParams.get('accountDeletion') === 'scheduled') {
      return 'Аккаунт запланирован к удалению. Проверьте почту: там ссылка для восстановления до указанной даты.';
    }

    if (searchParams.get('accountRestored') === '1') {
      return 'Аккаунт восстановлен. Вы можете войти с прежним паролем.';
    }

    return null;
  }, [searchParams]);

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
      <div className={styles.background}>
        <span className={styles.backgroundBlobLeft} aria-hidden="true" />
        <span className={styles.backgroundBlobRight} aria-hidden="true" />
      </div>

      <button className={styles.backButton} type="button" onClick={() => navigate('/')}>
        <span className={styles.backIcon}>←</span>
        <span>Назад</span>
      </button>

      <div className={styles.layout}>
        <div className={styles.stack}>
          <div className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.header}>
                <h1 className={styles.title}>Войти в аккаунт</h1>
              </div>

              <img
                className={styles.frame305Decor}
                src="/images/Frame%20305.svg"
                alt=""
                aria-hidden="true"
              />

              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <input
                    className={styles.input}
                    type="email"
                    value={loginStore.email}
                    onChange={(event) => loginStore.setEmail(event.target.value)}
                    placeholder="Ваш email"
                    autoComplete="username"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <input
                    className={styles.input}
                    type="password"
                    value={loginStore.password}
                    onChange={(event) => loginStore.setPassword(event.target.value)}
                    placeholder="Пароль"
                    autoComplete="current-password"
                    required
                  />
                </label>

                <div className={styles.optionsRow}>
                  <label className={styles.checkboxRow}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={loginStore.loginAsSpecialist}
                      onChange={(event) =>
                        loginStore.setLoginAsSpecialist(event.target.checked)
                      }
                    />
                    <span className={styles.checkboxLabel}>Войти как специалист</span>
                  </label>

                  <button
                    className={styles.inlineLink}
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Забыли пароль?
                  </button>
                </div>

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
              </form>

              
            </div>
          </div>

          <div className={styles.registerCard}>
            <p className={styles.registerText}>У вас ещё нет аккаунта?</p>

            <Link className={styles.registerButton} to="/register">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});
