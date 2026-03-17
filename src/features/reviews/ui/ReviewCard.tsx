//src/features/reviews/ui/ReviewCard.tsx

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Review } from '../model/types';
import styles from './ReviewCard.module.css';
import { ReviewPhotoModal } from './ReviewPhotoModal.tsx';

export function ReviewCard({
  review,
  showThanks,
  fixedLayout,
}: {
  review: Review;
  showThanks?: boolean;
  fixedLayout?: boolean;
}) {
  const photos = useMemo(() => review.photoUrls ?? [], [review.photoUrls]);
  const hasPhotos = photos.length > 0;

  const showPhotoCol = fixedLayout || hasPhotos;
  const showArrows = hasPhotos && photos.length > 1;

  const [idx, setIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const mainPhoto = useMemo(() => photos[idx] ?? '', [photos, idx]);

  const canPrev = idx > 0;
  const canNext = idx < photos.length - 1;

  return (
    <div className={fixedLayout ? styles.cardFixed : styles.card}>
      {showPhotoCol ? (
        <div className={styles.photoCol}>
          <div className={styles.photoWrap}>
            {hasPhotos ? (
              <>
                <button
                  type="button"
                  className={styles.photoBtn}
                  onClick={() => setModalOpen(true)}
                  aria-label="Открыть фото"
                >
                  <img className={styles.photo} src={mainPhoto} alt="Фото отзыва" />
                  {photos.length > 1 && <div className={styles.moreBadge}>+{photos.length - 1}</div>}
                </button>
              </>
            ) : (
              <div className={styles.photoPlaceholder} aria-hidden="true" />
            )}

            {/* ВАЖНО: в fixedLayout всегда резервируем место под стрелки */}
            <div className={styles.arrowsReserve}>
              {showArrows ? (
                <div className={styles.arrows}>
                  <button
                    type="button"
                    className={styles.arrowBtn}
                    disabled={!canPrev}
                    onClick={() => setIdx((v) => Math.max(0, v - 1))}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className={styles.arrowBtn}
                    disabled={!canNext}
                    onClick={() => setIdx((v) => Math.min(photos.length - 1, v + 1))}
                  >
                    →
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className={showPhotoCol ? styles.textCol : fixedLayout ? styles.textColFixedFull : styles.textColFull}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.serviceTitle}>{review.serviceTitle}</div>
            <div className={styles.stars}>{renderStars(review.rating)}</div>
          </div>

          <div className={styles.meta}>
            <div>Кличка: {review.petName}</div>
            <div>Хозяин: {review.ownerFullName}</div>
            <div>
              Петситтер:{' '}
              <Link className={styles.link} to={`/sitters/${review.sitterId}`}>
                {review.sitterName}
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.text}>{review.text}</div>

        <div className={styles.actions}>
          <Link className={styles.primaryBtn} to={`/sitters/${review.sitterId}`}>
            Перейти в профиль петситтера
          </Link>
        </div>

        {showThanks && (
          <div className={styles.thanksBottom}>
            Спасибо за отзыв!
          </div>
        )}
      </div>

      {
        hasPhotos && modalOpen ? (
          <ReviewPhotoModal photos={photos} startIndex={idx} onClose={() => setModalOpen(false)} />
        ) : null
      }
    </div >
  );
}

function renderStars(rating: number) {
  const r = Math.max(0, Math.min(5, Math.floor(rating)));
  const full = '★'.repeat(r);
  const empty = '☆'.repeat(5 - r);
  return `${full}${empty}`;
}