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
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to={profilePath} className={styles.backLink}>
            ← Профиль специалиста
          </Link>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Заказы клиентов</h1>
          <p className={styles.subtitle}>
            Подтверждайте новые заявки, начинайте и завершайте услуги. Связанные отзывы можно открыть со
            страницы ответов.
          </p>
          <Link to={`/specialists/${slug}/reviews`} className={styles.secondaryLink}>
            Отзывы и ответы
          </Link>
        </header>

        <OrdersServicesSection viewerRole="specialist" />
      </div>
    </div>
  );
};
