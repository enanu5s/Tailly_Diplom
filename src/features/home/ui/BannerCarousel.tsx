//src/features/home/ui/BannerCarousel.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HomeBanner } from '../model/types';
import styles from './BannerCarousel.module.css';

export function BannerCarousel(props: { items: HomeBanner[] }) {
  const navigate = useNavigate();
  const items = useMemo(() => props.items.slice(0, 6), [props.items]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx > items.length - 1) setIdx(0);
  }, [items.length, idx]);

  if (items.length === 0) return null;

  const canPrev = items.length > 1;
  const canNext = items.length > 1;

  const current = items[idx];

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.arrow}
        disabled={!canPrev}
        onClick={() => setIdx((v) => (v === 0 ? items.length - 1 : v - 1))}
        aria-label="Предыдущий баннер"
      >
        ←
      </button>

      <button
        type="button"
        className={styles.bannerBtn}
        onClick={() => navigate(`/about/news/${encodeURIComponent(current.newsId)}`)}
        aria-label="Открыть новость"
      >
        <div className={styles.banner} style={{ backgroundImage: `url(${current.imageUrl})` }}>
          <div className={styles.overlay}>
            <div className={styles.title}>{current.title}</div>
            <div className={styles.subtitle}>{current.subtitle}</div>
          </div>
        </div>
      </button>

      <button
        type="button"
        className={styles.arrow}
        disabled={!canNext}
        onClick={() => setIdx((v) => (v === items.length - 1 ? 0 : v + 1))}
        aria-label="Следующий баннер"
      >
        →
      </button>

      {items.length > 1 && (
        <div className={styles.dots} aria-label="Навигация по баннерам">
          {items.map((b, i) => (
            <button
              key={b.id}
              type="button"
              className={i === idx ? styles.dotActive : styles.dot}
              onClick={() => setIdx(i)}
              aria-label={`Баннер ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}