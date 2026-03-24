// src/pages/admin-dashboard/ui/AdminDashboardPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { adminProfileStore } from '@/features/admin-profile';
import { authStore } from '@/features/auth/model/authStore';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './AdminDashboardPage.module.css';
import {
  sortAdminDashboardActions,
  type AdminDashboardActionId,
} from '../lib/adminDashboardActionOrder';

import type { ReactElement } from 'react';

type AdminAction = {
  id: AdminDashboardActionId;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
};

export const AdminDashboardPage = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const authState = useSyncExternalStore(authStore.subscribe, authStore.getState);

  const user = authState.user;
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (!adminProfileStore.profile && !adminProfileStore.isLoading) {
      void adminProfileStore.load();
    }
  }, []);

  const position = adminProfileStore.profile?.position;
  const department = adminProfileStore.profile?.department;

  const actions = useMemo<AdminAction[]>(() => {
    const base: AdminAction[] = [
      {
        id: 'moderation',
        title: 'Модерация анкет специалистов',
        description: 'Раздел для последующей реализации проверки заявок специалистов.',
        actionLabel: 'Открыть раздел',
        onClick: () => navigate('/admin/moderation/specialists'),
      },
      {
        id: 'users',
        title: 'Управление пользователями',
        description:
          'Раздел для последующей реализации блокировки и разблокировки клиентов и специалистов.',
        actionLabel: 'Открыть раздел',
        onClick: () => navigate('/admin/users'),
      },
      {
        id: 'posts',
        title: 'Посты и баннеры',
        description:
          'Раздел для последующей реализации управления публикациями и баннерами.',
        actionLabel: 'Открыть раздел',
        onClick: () => navigate('/admin/posts'),
      },
    ];

    if (isSuperAdmin) {
      base.unshift(
        {
          id: 'superAdmins',
          title: 'Управление администраторами',
          description:
            'Раздел главного администратора для создания и управления обычными администраторами.',
          actionLabel: 'Открыть раздел',
          onClick: () => navigate('/super-admin/admins'),
        },
        {
          id: 'passwordRecovery',
          title: 'Восстановление паролей администраторов',
          description:
            'Просмотр и обработка заявок на восстановление паролей администраторов.',
          actionLabel: 'Открыть раздел',
          onClick: () => navigate('/super-admin/password-recovery'),
        },
      );
    }

    return sortAdminDashboardActions(base, position, department, isSuperAdmin);
  }, [isSuperAdmin, navigate, position, department]);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.badge}>
              {isSuperAdmin ? 'Главный администратор' : 'Администратор'}
            </span>

            <h1 className={styles.title}>Панель администратора</h1>

            <p className={styles.subtitle}>
              Добро пожаловать, {user?.name ?? user?.email ?? 'администратор'}.
            </p>
          </div>

          <button
            type="button"
            className={styles.profileLink}
            onClick={() => navigate('/admin/profile')}
          >
            Профиль администратора
          </button>
        </div>

        <div className={styles.grid}>
          {actions.map((item) => (
            <article key={item.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardDescription}>{item.description}</p>
              <button className={styles.cardButton} type="button" onClick={item.onClick}>
                {item.actionLabel}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
