// src/features/home/ui/BannerCarousel.tsx

import { useMemo, useState } from 'react';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './BannerCarousel.module.css';

import type { HomeBanner } from '../model/types';

type Props = {
  items: HomeBanner[];
};

const FALLBACK_BANNER_BACKGROUND =
  'linear-gradient(135deg, #cfe8a8 0%, #e8f0b8 38%, #fff3c8 100%)';

export function BannerCarousel({ items: rawItems }: Props) {
  const navigate = useAppNavigate();

  const items = useMemo(() => rawItems.slice(0, 5), [rawItems]);
  const [idx, setIdx] = useState(0);

  const safeIdx = items.length === 0 ? 0 : Math.min(idx, items.length - 1);

  if (items.length === 0) {
    return null;
  }

  const current = items[safeIdx];

  const hasImage = Boolean(current.imageUrl);
  const backgroundStyle = hasImage
    ? {
        backgroundImage: `url(${current.imageUrl})`,
      }
    : {
        backgroundImage: FALLBACK_BANNER_BACKGROUND,
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
        className={styles.bannerBtn}
        onClick={handleOpenPost}
        aria-label="Открыть пост"
      >
        <div
          className={`${styles.banner} ${hasImage ? '' : styles.bannerFallback}`}
          style={backgroundStyle}
        >
          <div className={`${styles.overlay} ${hasImage ? styles.overlayOnImage : ''}`}>
            <h3 className={styles.title}>{current.title}</h3>

            {current.subtitle ? (
              <p className={styles.subtitle}>{current.subtitle}</p>
            ) : null}
          </div>
        </div>
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
