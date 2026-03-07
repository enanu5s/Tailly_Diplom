// src/features/shop/ui/ProductGallery/ProductGallery.tsx
import { useEffect, useState } from 'react';

import type { ProductImage } from '../../model/types';

import styles from './ProductGallery.module.css';

type Props = {
  images: ProductImage[];
  productTitle: string;
};

export const ProductGallery = ({ images, productTitle }: Props) => {
  const [activeImageId, setActiveImageId] = useState<string | null>(
    images[0]?.id ?? null,
  );

  useEffect(() => {
    setActiveImageId(images[0]?.id ?? null);
  }, [images]);

  const activeImage =
    images.find((image) => image.id === activeImageId) ?? images[0] ?? null;

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageWrap}>
        {activeImage ? (
          <img
            className={styles.mainImage}
            src={activeImage.url}
            alt={activeImage.alt || productTitle}
          />
        ) : (
          <div className={styles.emptyState}>Изображение товара отсутствует</div>
        )}
      </div>

      {images.length > 1 ? (
        <div className={styles.thumbs} role="list" aria-label="Изображения товара">
          {images.map((image) => {
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
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};