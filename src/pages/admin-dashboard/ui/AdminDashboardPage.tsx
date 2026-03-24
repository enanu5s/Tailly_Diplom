// src/pages/admin-dashboard/ui/AdminDashboardPage.tsx
import { useMemo, useSyncExternalStore } from "react";


import { adminProfileStore } from "@/features/admin-profile";
import { authStore } from "@/features/auth/model/authStore";
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from "./AdminDashboardPage.module.css";

import type { ReactElement } from "react";

type AdminAction = {
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
};

export function AdminDashboardPage(): ReactElement {
  const navigate = useAppNavigate();
  const authState = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState
  );

  const user = authState.user;
  const isSuperAdmin = user?.role === "super_admin";

  const actions = useMemo<AdminAction[]>(() => {
    const result: AdminAction[] = [
      {
        title: "Профиль администратора",
        description:
          "Просмотр основных данных и входной точки для личного кабинета администратора.",
        actionLabel: "Открыть профиль",
        onClick: () => navigate("/admin/profile"),
      },
      {
        title: "Модерация анкет специалистов",
        description:
          "Раздел для последующей реализации проверки заявок специалистов.",
        actionLabel: "Открыть раздел",
        onClick: () => navigate("/admin/moderation/specialists"),
      },
      {
        title: "Управление пользователями",
        description:
          "Раздел для последующей реализации блокировки и разблокировки клиентов и специалистов.",
        actionLabel: "Открыть раздел",
        onClick: () => navigate("/admin/users"),
      },
      {
        title: "Посты и баннеры",
        description:
          "Раздел для последующей реализации управления публикациями и баннерами.",
        actionLabel: "Открыть раздел",
        onClick: () => navigate("/admin/posts"),
      },
    ];

    if (isSuperAdmin) {
      result.unshift(
        {
          title: "Управление администраторами",
          description:
            "Раздел главного администратора для создания и управления обычными администраторами.",
          actionLabel: "Открыть раздел",
          onClick: () => navigate("/super-admin/admins"),
        },
        {
          title: "Восстановление паролей администраторов",
          description:
            "Просмотр и обработка заявок на восстановление паролей администраторов.",
          actionLabel: "Открыть раздел",
          onClick: () => navigate("/super-admin/password-recovery"),
        }
      );
    }

    return result;
  }, [isSuperAdmin, navigate]);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.badge}>
              {isSuperAdmin ? "Главный администратор" : "Администратор"}
            </span>

            <h1 className={styles.title}>Панель администратора</h1>

            <p className={styles.subtitle}>
              Добро пожаловать, {user?.name ?? user?.email ?? "администратор"}.
            </p>
          </div>

          <button
            className={styles.logoutButton}
            type="button"
            onClick={() => {
              adminProfileStore.reset();
              authStore.logout();
              navigate("/login", {
                replace: true,
                preserveRouteMemory: false,
              });
            }}
          >
            Выйти
          </button>
        </div>

        <div className={styles.grid}>
          {actions.map((item) => (
            <article key={item.title} className={styles.card}>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardDescription}>{item.description}</p>
              <button
                className={styles.cardButton}
                type="button"
                onClick={item.onClick}
              >
                {item.actionLabel}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
