//src/pages/profile/ui/ProfilePage.tsx
import { useEffect } from 'react';
import { ProfileMainCard } from '@/features/profile';
import { PetsSection } from '@/features/pets';
import { profileStore } from '@/features/profile/model/profileStore';
import styles from './ProfilePage.module.css';
import { OrdersProductsSection, OrdersServicesSection } from '@/features/orders';

export const ProfilePage = () => {
  useEffect(() => {
    // при заходе — наверх
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // заранее подгрузим профиль (чтобы имя/данные были сразу)
    if (!profileStore.profile && !profileStore.loading) {
      void profileStore.load();
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.h1}>Профиль</h1>

        <div className={styles.grid}>
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className={styles.leftCol}>
            <ProfileMainCard />
            <PetsSection />
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className={styles.rightCol}>
            {
              <div className={styles.rightCol}>
                <OrdersServicesSection />
                <OrdersProductsSection />
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};