//src/features/home/ui/ReviewsCarousel.tsx

import { useMemo, useState } from 'react';

import { ReviewCard } from '@/features/reviews';
import type { Review } from '@/features/reviews/model/types';

import styles from './ReviewsCarousel.module.css';

import type { HomeReview } from '../model/types';

export function ReviewsCarousel(props: { items: HomeReview[] }) {
  const items = useMemo(() => props.items.slice(0, 5), [props.items]);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<'left' | 'right'>('right');
  const [animKey, setAnimKey] = useState(0);

  if (items.length === 0) return null;

  const canNav = items.length > 1;
  const secondIdx = items.length > 1 ? (idx + 1) % items.length : 0;

  const reviewA: Review = mapHomeReviewToReview(items[idx]);
  const reviewB: Review = mapHomeReviewToReview(items[secondIdx]);

  const handlePrev = (): void => {
    setDir('right');
    setAnimKey((k) => k + 1);
    setIdx((v) => (v === 0 ? items.length - 1 : v - 1));
  };

  const handleNext = (): void => {
    setDir('left');
    setAnimKey((k) => k + 1);
    setIdx((v) => (v === items.length - 1 ? 0 : v + 1));
  };

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Реальные отзывы клиентов</h2>

      <div
        key={animKey}
        className={`${items.length >= 2 ? styles.cardsGrid : styles.cardsGridSingle} ${dir === 'left' ? styles.slideLeft : styles.slideRight}`}
      >
        <ReviewCard review={reviewA} fixedLayout variant="landing" ctaLabel="Перейти к специалисту" />
        {items.length >= 2 ? (
          <ReviewCard review={reviewB} fixedLayout variant="landing" ctaLabel="Перейти к специалисту" />
        ) : null}
      </div>

      {canNav && (
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={handlePrev} aria-label="Предыдущие отзывы">
            <img src="/icons/arrow-left.svg" alt="" />
          </button>
          <button type="button" className={styles.arrow} onClick={handleNext} aria-label="Следующие отзывы">
            <img src="/icons/arrow-right.svg" alt="" />
          </button>
        </div>
      )}
    </div>
  );
}

function mapHomeReviewToReview(r: HomeReview): Review {
  return {
    id: r.id,
    orderId: r.id,
    rating: r.rating,
    text: r.text,
    photoUrls: r.photoUrls ?? [],
    createdAtIso: r.createdAtIso,

    petName: r.petName,
    ownerFullName: r.ownerName,

    sitterId: r.sitterId,
    sitterName: r.sitterName,

    serviceTitle: r.serviceTitle,
  };
}
