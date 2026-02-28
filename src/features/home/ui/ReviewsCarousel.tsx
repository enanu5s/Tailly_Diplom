//src/features/home/ui/ReviewsCarousel.tsx

import { useMemo, useState } from 'react';
import type { HomeReview } from '../model/types';
import styles from './ReviewsCarousel.module.css';

import { ReviewCard } from '@/features/reviews';
import type { Review } from '@/features/reviews/model/types';

export function ReviewsCarousel(props: { items: HomeReview[] }) {
  const items = useMemo(() => props.items.slice(0, 5), [props.items]);
  const [idx, setIdx] = useState(0);

  if (items.length === 0) return null;

  const current = items[idx];

  const review: Review = mapHomeReviewToReview(current);

  const canPrev = items.length > 1;
  const canNext = items.length > 1;

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.title}>Отзывы клиентов</div>
      </div>

      <div className={styles.cardWrap}>
        <ReviewCard review={review} fixedLayout/>
      </div>

      {items.length > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            disabled={!canPrev}
            onClick={() => setIdx((v) => (v === 0 ? items.length - 1 : v - 1))}
            aria-label="Предыдущий отзыв"
          >
            ←
          </button>

          <div className={styles.dots} aria-label="Навигация по отзывам">
            {items.map((r, i) => (
              <button
                key={r.id}
                type="button"
                className={i === idx ? styles.dotActive : styles.dot}
                onClick={() => setIdx(i)}
                aria-label={`Отзыв ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.arrow}
            disabled={!canNext}
            onClick={() => setIdx((v) => (v === items.length - 1 ? 0 : v + 1))}
            aria-label="Следующий отзыв"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

function mapHomeReviewToReview(r: HomeReview): Review {
  return {
    id: r.id,
    orderId: r.id, // для главной не критично; типу Review нужно поле
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