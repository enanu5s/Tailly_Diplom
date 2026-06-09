//src/pages/home/ui/HomePage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import {
  homeStore,
  BannerCarousel,
  ServicesMenu,
  ReviewsCarousel,
  Faq,
} from '@/features/home';
import { FeedbackSection } from '@/shared/ui/feedback';

import styles from './HomePage.module.css';

export const HomePage = observer(() => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (!homeStore.loading && homeStore.banners.length === 0 && !homeStore.error) {
      void homeStore.load();
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {homeStore.error && <div className={styles.error}>{homeStore.error}</div>}

        <section className={styles.block}>
          <BannerCarousel items={homeStore.banners} />
        </section>

        <section className={styles.block}>
          <h2 className={styles.sectionTitle}>Услуги для ваших питомцев</h2>
          <ServicesMenu items={homeStore.services} />
        </section>

        <section className={styles.block}>
          <ReviewsCarousel items={homeStore.reviews} />
        </section>

        <section className={styles.block}>
          <Faq />
        </section>

      </div>
      <FeedbackSection className={styles.feedbackOnHome} />
    </div>
  );
});
