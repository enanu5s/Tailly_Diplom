//src/features/reviews/ui/ReviewPhotoModal.tsx

import { useEffect, useState } from 'react';
import styles from './ReviewPhotoModal.module.css';

export function ReviewPhotoModal(props: { photos: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(props.startIndex);

  const canPrev = idx > 0;
  const canNext = idx < props.photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose();
      if (e.key === 'ArrowLeft' && canPrev) setIdx((v) => Math.max(0, v - 1));
      if (e.key === 'ArrowRight' && canNext) setIdx((v) => Math.min(props.photos.length - 1, v + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props, canPrev, canNext]);

  return (
    <div className={styles.overlay} onClick={props.onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} type="button" onClick={props.onClose} aria-label="Закрыть">
          ✕
        </button>

        <div className={styles.photoWrap}>
          <img className={styles.photo} src={props.photos[idx]} alt="Фото" />
        </div>

        {props.photos.length > 1 && (
          <div className={styles.controls}>
            <button className={styles.arrowBtn} type="button" disabled={!canPrev} onClick={() => setIdx((v) => Math.max(0, v - 1))}>
              ←
            </button>
            <div className={styles.counter}>
              {idx + 1} / {props.photos.length}
            </div>
            <button className={styles.arrowBtn} type="button" disabled={!canNext} onClick={() => setIdx((v) => Math.min(props.photos.length - 1, v + 1))}>
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}