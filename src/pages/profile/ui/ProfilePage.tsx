// src/pages/profile/ui/ProfilePage.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/model/useAuth';
import { ProfileMainCard } from '@/features/profile';
import { PetsSection } from '@/features/pets';
import { profileStore } from '@/features/profile/model/profileStore';
import { OrdersProductsSection, OrdersServicesSection } from '@/features/orders';

import styles from './ProfilePage.module.css';

const ADMIN_ROLE_LABELS = {
  admin: 'Администратор',
  super_admin: 'Главный администратор',
} as const;

function ClientProfileContent() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    if (!profileStore.profile && !profileStore.loading) {
      void profileStore.load();
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Профиль</h1>

        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <ProfileMainCard />
            <PetsSection />
          </div>

          <div className={styles.rightColumn}>
            <OrdersServicesSection />
            <OrdersProductsSection />
          </div>
        </div>
      </div>
    </div>
  );
}

type AdminCabinetProps = {
  role: 'admin' | 'super_admin';
};

function AdminCabinetPlaceholder({ role }: AdminCabinetProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.adminCard}>
          <span className={styles.adminBadge}>{ADMIN_ROLE_LABELS[role]}</span>
          <h1 className={styles.title}>Кабинет администратора</h1>
          <p className={styles.adminText}>
            Для этой роли уже работает корректная маршрутизация через <code>/profile</code>,
            но отдельный административный интерфейс ещё не реализован.
          </p>
        </div>
      </div>
    </div>
  );
}

export const ProfilePage = () => {
  const location = useLocation();
  const { role, user, isGuest } = useAuth();

  if (isGuest) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  if (role === 'specialist') {
    if (!user?.specialistSlug) {
      return (
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.adminCard}>
              <h1 className={styles.title}>Профиль специалиста недоступен</h1>
              <p className={styles.adminText}>
                У текущего специалиста не найден slug профиля. Добавь
                <code> specialistSlug </code>
                в данные авторизации или в ответ backend.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to={`/specialists/${user.specialistSlug}`} replace />;
  }

  if (role === 'admin' || role === 'super_admin') {
    return <AdminCabinetPlaceholder role={role} />;
  }

  return <ClientProfileContent />;
};