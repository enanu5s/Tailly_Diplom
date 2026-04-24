// src/features/shop/ui/ProductGallery/ProductGallery.tsx
import { useState } from 'react';

import styles from './ProductGallery.module.css';

import type { ProductImage } from '../../model/types';

type Props = {
  images: ProductImage[];
  productTitle: string;
};

export const ProductGallery = ({ images, productTitle }: Props) => {
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());

  const visibleImages = images.filter((image) => !failedImageIds.has(image.id));

  const activeImage =
    visibleImages.find((image) => image.id === activeImageId) ?? visibleImages[0] ?? null;

  const handleImageError = (imageId: string): void => {
    setFailedImageIds((current) => {
      const next = new Set(current);
      next.add(imageId);
      return next;
    });

    if (activeImageId === imageId) {
      setActiveImageId(null);
    }
  };

  return (
    <div className={styles.gallery}>
      {visibleImages.length > 1 ? (
        <div className={styles.thumbs} role="list" aria-label="Изображения товара">
          {visibleImages.map((image) => {
            const isActive = image.id === activeImage?.id;

            return (
              <button
                key={image.id}
                className={`${styles.thumbButton} ${isActive ? styles.thumbButtonActive : ''}`}
                type="button"
                onClick={() => setActiveImageId(image.id)}
                aria-label={`Показать изображение ${image.alt || productTitle}`}
              >
                <img
                  className={styles.thumbImage}
                  src={image.url}
                  alt={image.alt || productTitle}
                  onError={() => handleImageError(image.id)}
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.thumbsPlaceholder} />
      )}

      <div className={styles.mainImageWrap}>
        {activeImage ? (
          <img
            className={styles.mainImage}
            src={activeImage.url}
            alt={activeImage.alt || productTitle}
            onError={() => handleImageError(activeImage.id)}
          />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <span className={styles.emptySun} />
              <span className={styles.emptyLineOne} />
              <span className={styles.emptyLineTwo} />
            </div>
            <span>Фото недоступно</span>
          </div>
        )}
      </div>
    </div>
  );
};