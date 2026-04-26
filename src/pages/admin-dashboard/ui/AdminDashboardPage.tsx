// src/pages/admin-dashboard/ui/AdminDashboardPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { adminProfileStore } from '@/features/admin-profile';
import { authStore } from '@/features/auth/model/authStore';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import {
  sortAdminDashboardActions,
  type AdminDashboardActionId,
} from '../lib/adminDashboardActionOrder';

import styles from './AdminDashboardPage.module.css';

import type { ReactElement } from 'react';

type AdminAction = {
  id: AdminDashboardActionId;
  title: string;
  description: string;
  iconSrc: string;
  onClick: () => void;
};

const ADMIN_DASHBOARD_ICONS: Record<AdminDashboardActionId, string> = {
  superAdmins: '/images/admin-dashboard/admin_6i02kz2k49wh 1.svg',
  passwordRecovery: '/images/admin-dashboard/parol_0m6jwe6bifoz 1.svg',
  moderation: '/images/admin-dashboard/fluent-mdl2_questionnaire-mirrored.svg',
  users: '/images/admin-dashboard/ph_users-four-light.svg',
  posts: '/images/admin-dashboard/bi_card-heading.svg',
};

export const AdminDashboardPage = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const authState = useSyncExternalStore(authStore.subscribe, authStore.getState);

  const user = authState.user;
  const isSuperAdmin = user?.role === 'super_admin';
  const userName = user?.name ?? user?.email ?? 'администратор';

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
        description: 'Проверка и одобрение заявок специалистов с последующим созданием аккаунта',
        iconSrc: ADMIN_DASHBOARD_ICONS.moderation,
        onClick: () => navigate('/admin/moderation/specialists'),
      },
      {
        id: 'users',
        title: 'Управление пользователями',
        description: 'Редактирование данных пользователей и блокировка при нарушении правил',
        iconSrc: ADMIN_DASHBOARD_ICONS.users,
        onClick: () => navigate('/admin/users'),
      },
      {
        id: 'posts',
        title: 'Посты и баннеры',
        description: 'Добавление, редактирование и удаление публикаций, баннеров на платформе',
        iconSrc: ADMIN_DASHBOARD_ICONS.posts,
        onClick: () => navigate('/admin/posts'),
      },
    ];

    if (isSuperAdmin) {
      base.unshift(
        {
          id: 'superAdmins',
          title: 'Управление администраторами',
          description: 'Назначение и удаление администраторов, настройка их прав и доступа',
          iconSrc: ADMIN_DASHBOARD_ICONS.superAdmins,
          onClick: () => navigate('/super-admin/admins'),
        },
        {
          id: 'passwordRecovery',
          title: 'Восстановление паролей администраторов',
          description: 'Просмотр и подтверждение заявок на сброс пароля администраторов',
          iconSrc: ADMIN_DASHBOARD_ICONS.passwordRecovery,
          onClick: () => navigate('/super-admin/password-recovery'),
        },
      );
    }

    return sortAdminDashboardActions(base, position, department, isSuperAdmin);
  }, [isSuperAdmin, navigate, position, department]);

  return (
    <section className={styles.page}>
      <img
        className={styles.blur}
        src="/images/admin-dashboard/Ellipse_blur.svg"
        alt=""
        aria-hidden="true"
      />

      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.leftColumn}>
            <h1 className={styles.title}>Панель администратора</h1>

            <div className={styles.welcomeCard}>
              <h2 className={styles.welcomeTitle}>Добро пожаловать, {userName}!</h2>

              <button
                type="button"
                className={styles.profileButton}
                onClick={() => navigate('/admin/profile')}
              >
                Перейти в профиль администратора
              </button>
            </div>
          </div>

          <img
            className={styles.heroImage}
            src="/images/admin-dashboard/Frame 487.png"
            alt=""
            aria-hidden="true"
          />
        </div>

        <div className={styles.grid}>
          {actions.map((item) => (
            <button key={item.id} type="button" className={styles.card} onClick={item.onClick}>
              <img className={styles.cardIcon} src={item.iconSrc} alt="" aria-hidden="true" />

              <span className={styles.cardTitle}>{item.title}</span>
              <span className={styles.cardDescription}>{item.description}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});