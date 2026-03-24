// src/features/specialist-profile/ui/SpecialistPhotoGallery.tsx

import { useEffect, useMemo, useState } from 'react';

import styles from './SpecialistPhotoGallery.module.css';

import type { SpecialistGalleryItem } from '../model/types';

type Props = {
  items: SpecialistGalleryItem[];
  title?: string;
  emptyText?: string;
};

const PREVIEW_IMAGE_COUNT = 2;

function getPhotosLabel(count: number): string {
  return `${count} фото`;
}

export function SpecialistPhotoGallery({
  items,
  title = 'Фотографии специалиста',
  emptyText = 'Пока фотографий нет.',
}: Props) {
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const safeItems = useMemo(
    () => items.filter((item) => item.imageUrl.trim().length > 0),
    [items],
  );

  const previewItems = useMemo(() => {
    return safeItems.slice(0, PREVIEW_IMAGE_COUNT);
  }, [safeItems]);

  const hiddenPhotosCount = Math.max(safeItems.length - previewItems.length, 0);

  const isLightboxOpen = activeIndex !== null;
  const activeItem = activeIndex !== null ? (safeItems[activeIndex] ?? null) : null;

  useEffect(() => {
    if (!isGridOpen && !isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isGridOpen, isLightboxOpen]);

  useEffect(() => {
    if (!isGridOpen && !isLightboxOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        if (isLightboxOpen) {
          setActiveIndex(null);
          return;
        }

        setIsGridOpen(false);
        return;
      }

      if (!isLightboxOpen || safeItems.length <= 1) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev === null) {
            return 0;
          }

          return (prev + 1) % safeItems.length;
        });
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev === null) {
            return 0;
          }

          return (prev - 1 + safeItems.length) % safeItems.length;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGridOpen, isLightboxOpen, safeItems.length]);

  const openGrid = (): void => {
    if (safeItems.length === 0) {
      return;
    }

    setIsGridOpen(true);
  };

  const closeGrid = (): void => {
    setActiveIndex(null);
    setIsGridOpen(false);
  };

  const openLightbox = (index: number): void => {
    setActiveIndex(index);
  };

  const closeLightbox = (): void => {
    setActiveIndex(null);
  };

  const showPrevious = (): void => {
    if (safeItems.length <= 1) {
      return;
    }

    setActiveIndex((prev) => {
      if (prev === null) {
        return 0;
      }

      return (prev - 1 + safeItems.length) % safeItems.length;
    });
  };

  const showNext = (): void => {
    if (safeItems.length <= 1) {
      return;
    }

    setActiveIndex((prev) => {
      if (prev === null) {
        return 0;
      }

      return (prev + 1) % safeItems.length;
    });
  };

  if (safeItems.length === 0) {
    return <p className={styles.emptyState}>{emptyText}</p>;
  }
  return (
    <>
      <section className={styles.section} aria-label={title}>
        <div className={styles.previewGrid}>
          {previewItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.previewCard}
              onClick={openGrid}
              aria-label={`Открыть все фотографии специалиста.${item.alt}`}
            >
              <img className={styles.previewImage} src={item.imageUrl} alt={item.alt} />
            </button>
          ))}

          {hiddenPhotosCount > 0 ? (
            <button
              type="button"
              className={styles.moreCard}
              onClick={openGrid}
              aria-label={`Открыть все фотографии специалиста.Доступно ещё ${hiddenPhotosCount}`}
            >
              <span className={styles.moreCount}>+{hiddenPhotosCount} фото</span>
              <span className={styles.moreHint}>Открыть все</span>
            </button>
          ) : null}
        </div>
      </section>

      {isGridOpen ? (
        <div className={styles.overlay} onClick={closeGrid} role="presentation">
          <div
            className={styles.gridModal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фотографий специалиста"
          >
            <div className={styles.modalHeader}>
              <div>
                <h4 className={styles.modalTitle}>{title}</h4>
                <p className={styles.modalMeta}>{getPhotosLabel(safeItems.length)}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeGrid}
                aria-label="Закрыть просмотр фотографий"
              >
                ×
              </button>
            </div>

            <div className={styles.modalGrid}>
              {safeItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.modalGridCard}
                  onClick={() => openLightbox(index)}
                  aria-label={`Открыть фото ${index + 1}`}
                >
                  <img
                    className={styles.modalGridImage}
                    src={item.imageUrl}
                    alt={item.alt}
                  />
                </button>
              ))}
            </div>
          </div>

          {isLightboxOpen && activeItem ? (
            <div className={styles.lightbox} onClick={closeLightbox} role="presentation">
              <div
                className={styles.lightboxContent}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Просмотр фотографии"
              >
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={closeLightbox}
                  aria-label="Закрыть фото"
                >
                  ×
                </button>

                {safeItems.length > 1 ? (
                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.navButtonLeft}`}
                    onClick={showPrevious}
                    aria-label="Предыдущее фото"
                  >
                    ‹
                  </button>
                ) : null}

                <div className={styles.lightboxImageWrap}>
                  <img
                    className={styles.lightboxImage}
                    src={activeItem.imageUrl}
                    alt={activeItem.alt}
                  />
                  <div className={styles.lightboxFooter}>
                    <span className={styles.lightboxCounter}>
                      {(activeIndex ?? 0) + 1} / {safeItems.length}
                    </span>
                    <span className={styles.lightboxCaption}>{activeItem.alt}</span>
                  </div>
                </div>

                {safeItems.length > 1 ? (
                  <button
                    type="button"
                    className={`${styles.navButton} ${styles.navButtonRight}`}
                    onClick={showNext}
                    aria-label="Следующее фото"
                  >
                    ›
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
