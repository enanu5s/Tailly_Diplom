// src/features/home/ui/BannerCarousel.tsx

import { useMemo, useState } from 'react';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './BannerCarousel.module.css';

import type { HomeBanner } from '../model/types';

type Props = {
  items: HomeBanner[];
};

const FALLBACK_BANNER_BACKGROUND =
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #0f172a 100%)';

export function BannerCarousel({ items: rawItems }: Props) {
  const navigate = useAppNavigate();

  const items = useMemo(() => rawItems.slice(0, 5), [rawItems]);
  const [idx, setIdx] = useState(0);

  const safeIdx = items.length === 0 ? 0 : Math.min(idx, items.length - 1);

  if (items.length === 0) {
    return null;
  }

  const current = items[safeIdx];
  const canSlide = items.length > 1;

  const backgroundStyle = current.imageUrl
    ? {
        backgroundImage: `url(${current.imageUrl})`,
      }
    : {
        backgroundImage: FALLBACK_BANNER_BACKGROUND,
      };

  const handlePrev = (): void => {
    setIdx((value) => (value === 0 ? items.length - 1 : value - 1));
  };

  const handleNext = (): void => {
    setIdx((value) => (value === items.length - 1 ? 0 : value + 1));
  };

  const handleOpenPost = (): void => {
    if (current.linkUrl) {
      navigate(current.linkUrl, {
        state: {
          from: 'home',
        },
      });
      return;
    }
  
    if (current.postId) {
      navigate(`/posts/${encodeURIComponent(current.postId)}`, {
        state: {
          from: 'home',
        },
      });
    }
  };

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.arrow}
        onClick={handlePrev}
        disabled={!canSlide}
        aria-label="Предыдущий баннер"
      >
        ←
      </button>

      <button
        type="button"
        className={styles.bannerBtn}
        onClick={handleOpenPost}
        aria-label="Открыть пост"
      >
        <div className={styles.banner} style={backgroundStyle}>
          <div className={styles.overlay}>
            <h3 className={styles.title}>{current.title}</h3>

            {current.subtitle ? (
              <p className={styles.subtitle}>{current.subtitle}</p>
            ) : null}
          </div>
        </div>
      </button>

      <button
        type="button"
        className={styles.arrow}
        onClick={handleNext}
        disabled={!canSlide}
        aria-label="Следующий баннер"
      >
        →
      </button>

      {items.length > 1 ? (
        <div className={styles.dots}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === safeIdx ? styles.dotActive : styles.dot}
              onClick={() => setIdx(index)}
              aria-label={`Баннер ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}