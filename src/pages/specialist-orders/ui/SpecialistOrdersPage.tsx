// src/pages/specialist-orders/ui/SpecialistOrdersPage.tsx

import { Link, useParams } from 'react-router-dom';

import { OrdersServicesSection } from '@/features/orders';

import styles from './SpecialistOrdersPage.module.css';

import type { ReactElement } from 'react';

export const SpecialistOrdersPage = (): ReactElement => {
  const { specialistSlug } = useParams<{ specialistSlug: string }>();
  const slug = specialistSlug?.trim() ?? '';
  const profilePath = slug ? `/specialists/${slug}` : '/';

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link to={profilePath} className={styles.backPill}>
          <span className={styles.backArrow} aria-hidden />
          Назад
        </Link>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>Заказы клиентов</h1>
        </div>

        <OrdersServicesSection viewerRole="specialist" presentation="specialistOrders" />
      </div>
    </div>
  );
};
