// src/pages/admin-login/ui/AdminLoginPage.tsx

import { observer } from "mobx-react-lite";
import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { useAppNavigate } from "@/shared/lib/navigation/useAppNavigate";

import { adminLoginStore } from "@/features/admin-auth/model/adminLoginStore";
import { authStore } from "@/features/auth/model/authStore";
import { canAccessAdminArea } from "@/shared/lib/auth/roleAccess";

import styles from "./AdminLoginPage.module.css";

import type { FormEvent, ReactElement } from "react";

type LocationState = {
  from?: string;
};

export const AdminLoginPage = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const location = useLocation();
  const authState = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState
  );

  const state = (location.state ?? null) as LocationState | null;

  useEffect(() => {
    if (canAccessAdminArea(authState.user)) {
      navigate("/admin", { replace: true });
    }
  }, [authState.user, navigate]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const success = await adminLoginStore.submit();

    if (!success) {
      return;
    }

    navigate(state?.from ?? "/admin", { replace: true });
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>Tailly Admin</span>

          <h1 className={styles.title}>Вход для администратора</h1>

          <p className={styles.subtitle}>
            Используйте корпоративный логин и пароль администратора.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>

            <input
              className={styles.input}
              type="email"
              value={adminLoginStore.email}
              onChange={(event) => adminLoginStore.setEmail(event.target.value)}
              placeholder="admin@tailly.local"
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Пароль</span>

            <input
              className={styles.input}
              type="password"
              value={adminLoginStore.password}
              onChange={(event) =>
                adminLoginStore.setPassword(event.target.value)
              }
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
            />
          </label>

          {adminLoginStore.failedAttemptsLeft !== null &&
          adminLoginStore.failedAttemptsLeft > 0 ? (
            <div className={styles.attempts}>
              Осталось попыток: {adminLoginStore.failedAttemptsLeft}
            </div>
          ) : null}

          {adminLoginStore.submitError ? (
            <div className={styles.error}>{adminLoginStore.submitError}</div>
          ) : null}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={!adminLoginStore.canSubmit}
          >
            {adminLoginStore.isSubmitting ? "Выполняется вход..." : "Войти"}
          </button>

          <button
            className={styles.linkButton}
            type="button"
            onClick={() => navigate("/admin/forgot-password")}
          >
            Восстановить пароль
          </button>
        </form>
      </div>
    </section>
  );
});
