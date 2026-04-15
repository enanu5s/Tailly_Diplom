import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './ReviewCard.module.css';
import { ReviewPhotoModal } from './ReviewPhotoModal.tsx';

import type { Review } from '../model/types';

type ReviewCardProps = {
  review: Review;
  showThanks?: boolean;
  fixedLayout?: boolean;
  variant?: 'default' | 'landing';
  ctaLabel?: string;
};

export function ReviewCard({
  review,
  showThanks,
  fixedLayout,
  variant = 'default',
  ctaLabel,
}: ReviewCardProps) {
  const photos = useMemo(() => review.photoUrls ?? [], [review.photoUrls]);
  const hasPhotos = photos.length > 0;

  const showPhotoCol = fixedLayout || hasPhotos;
  const showArrows = variant !== 'landing' && hasPhotos && photos.length > 1;

  const [idx, setIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const mainPhoto = useMemo(() => photos[idx] ?? '', [photos, idx]);

  const canPrev = idx > 0;
  const canNext = idx < photos.length - 1;

  const cardClass =
    fixedLayout && variant === 'landing'
      ? `${styles.cardFixed} ${styles.cardLanding}`
      : fixedLayout
        ? styles.cardFixed
        : styles.card;

  const textColClass = showPhotoCol
    ? styles.textCol
    : fixedLayout
      ? styles.textColFixedFull
      : styles.textColFull;

  return (
    <div className={cardClass}>
      {showPhotoCol ? (
        <div className={styles.photoCol}>
          <div className={styles.photoWrap}>
            {hasPhotos ? (
              <button
                type="button"
                className={styles.photoBtn}
                onClick={() => setModalOpen(true)}
                aria-label="Открыть фото"
              >
                <img className={styles.photo} src={mainPhoto} alt="Фото отзыва" />
                {photos.length > 1 ? (
                  <div className={styles.moreBadge}>+{photos.length - 1}</div>
                ) : null}
              </button>
            ) : (
              <div className={styles.photoPlaceholder} aria-hidden="true" />
            )}

            {variant !== 'landing' ? (
              <div className={styles.arrowsReserve}>
                {showArrows ? (
                  <div className={styles.arrows}>
                    <button
                      type="button"
                      className={styles.arrowBtn}
                      disabled={!canPrev}
                      onClick={() => setIdx((value) => Math.max(0, value - 1))}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className={styles.arrowBtn}
                      disabled={!canNext}
                      onClick={() =>
                        setIdx((value) => Math.min(photos.length - 1, value + 1))
                      }
                    >
                      →
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={textColClass}>
        {variant === 'landing' ? (
          <>
            <div className={styles.landingTop}>
              <div className={styles.header}>
                <div className={styles.titleRow}>
                  <div className={styles.serviceTitleBlock}>
                    <div className={styles.serviceTitle}>{review.serviceTitle}</div>
                    <div className={styles.serviceCityPlaceholder} aria-hidden="true" />
                  </div>

                  <div
                    className={styles.stars}
                    aria-label={`Рейтинг ${review.rating} из 5`}
                  >
                    <Stars rating={review.rating} />
                  </div>
                </div>

                <div className={styles.metaLanding}>
                  <div className={styles.specialistLine}>
                    <span className={styles.specialistLabel}>Специалист:</span>{' '}
                    <Link
                      className={styles.linkLanding}
                      to={`/specialists/${encodeURIComponent(review.sitterId)}`}
                    >
                      {review.sitterName}
                    </Link>
                  </div>
                </div>
              </div>

              <div className={styles.textLanding}>{review.text}</div>
            </div>

            <div className={styles.actions}>
              <Link
                className={styles.primaryBtn}
                to={`/specialists/${encodeURIComponent(review.sitterId)}`}
              >
                {ctaLabel ?? 'Перейти в профиль петситтера'}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.titleRow}>
                <div className={styles.serviceTitle}>{review.serviceTitle}</div>
                <div
                  className={styles.stars}
                  aria-label={`Рейтинг ${review.rating} из 5`}
                >
                  <Stars rating={review.rating} />
                </div>
              </div>

              <div className={styles.meta}>
                <div>Кличка: {review.petName}</div>
                <div>Хозяин: {review.ownerFullName}</div>
                <div>
                  Петситтер:{' '}
                  <Link
                    className={styles.link}
                    to={`/specialists/${encodeURIComponent(review.sitterId)}`}
                  >
                    {review.sitterName}
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.text}>{review.text}</div>

            <div className={styles.actions}>
              <Link
                className={styles.primaryBtn}
                to={`/specialists/${encodeURIComponent(review.sitterId)}`}
              >
                {ctaLabel ?? 'Перейти в профиль петситтера'}
              </Link>
            </div>
          </>
        )}

        {showThanks ? <div className={styles.thanksBottom}>Спасибо за отзыв!</div> : null}
      </div>

      {hasPhotos && modalOpen ? (
        <ReviewPhotoModal
          photos={photos}
          startIndex={idx}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

type StarsProps = {
  rating: number;
};

function Stars({ rating }: StarsProps) {
  const normalizedRating = Math.max(0, Math.min(5, Math.floor(rating)));

  return (
    <div className={styles.starsRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < normalizedRating;

        return (
          <span
            key={index}
            className={isFilled ? styles.starFilled : styles.star}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
