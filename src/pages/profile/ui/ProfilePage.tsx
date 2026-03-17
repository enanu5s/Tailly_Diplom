// src/pages/profile/ui/ProfilePage.tsx

import { useEffect, useSyncExternalStore } from 'react';
import { Navigate } from 'react-router-dom';

import { authStore } from '@/features/auth/model/authStore';
import { OrdersProductsSection, OrdersServicesSection } from '@/features/orders';
import { PetsSection } from '@/features/pets';
import { profileStore } from '@/features/profile/model/profileStore';
import { ProfileMainCard } from '@/features/profile/ui/ProfileMainCard';

import styles from './ProfilePage.module.css';

import type { ReactElement } from 'react';

export const ProfilePage = (): ReactElement => {
  const authState = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
  );

  const user = authState.user;
  const role = user?.role ?? 'guest';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    if (role === 'client' && !profileStore.profile && !profileStore.loading) {
      void profileStore.load();
    }
  }, [role]);

  if (!authState.token || !user || role === 'guest') {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' || role === 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  if (role === 'specialist') {
    const specialistSlug = user.specialistSlug?.trim();

    if (specialistSlug) {
      return (
        <Navigate
          to={`/specialists/${specialistSlug}`}
          replace
        />
      );
    }

    return <Navigate to="/" replace />;
  }

  return (
    <section className={styles.page}>
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
    </section>
  );
};