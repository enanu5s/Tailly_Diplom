//src/pages/home/ui/HomePage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { homeStore, BannerCarousel, ServicesMenu, ReviewsCarousel, Faq } from '@/features/home';
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

        <div className={styles.block}>
          <BannerCarousel items={homeStore.banners} />
        </div>

        <div className={styles.block}>
          <div className={styles.h2}>Услуги</div>
          <ServicesMenu items={homeStore.services} />
        </div>

        <div className={styles.block}>
          <ReviewsCarousel items={homeStore.reviews} />
        </div>

        <div className={styles.block}>
          <Faq />
        </div>
        <FeedbackSection />
      </div>
    </div>
  );
});