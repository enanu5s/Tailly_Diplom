import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './ProductGalleryModal.module.css';

type Props = {
  photos: string[];
  startIndex: number;
  onClose: () => void;
  altText: string;
};

export function ProductGalleryModal({ photos, startIndex, onClose, altText }: Props) {
  const [idx, setIdx] = useState(Math.max(0, Math.min(startIndex, photos.length - 1)));

  const canPrev = idx > 0;
  const canNext = idx < photos.length - 1;

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && canPrev) setIdx((value) => Math.max(0, value - 1));
      if (event.key === 'ArrowRight' && canNext) {
        setIdx((value) => Math.min(photos.length - 1, value + 1));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canNext, canPrev, onClose, photos.length]);

  const modal = (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button
          className={styles.closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ✕
        </button>

        <div className={styles.photoWrap}>
          <img className={styles.photo} src={photos[idx]} alt={altText} />
        </div>

        {photos.length > 1 ? (
          <div className={styles.controls}>
            <button
              className={styles.arrowBtn}
              type="button"
              disabled={!canPrev}
              onClick={() => setIdx((value) => Math.max(0, value - 1))}
              aria-label="Предыдущее фото"
            >
              ←
            </button>
            <div className={styles.counter}>
              {idx + 1} / {photos.length}
            </div>
            <button
              className={styles.arrowBtn}
              type="button"
              disabled={!canNext}
              onClick={() => setIdx((value) => Math.min(photos.length - 1, value + 1))}
              aria-label="Следующее фото"
            >
              →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
