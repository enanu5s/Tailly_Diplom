//src/features/posts/ui/PostsCarousel.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { saveScrollPosition } from '@/shared/lib/scroll';

import styles from './PostsCarousel.module.css';
import { postsStore } from '../model/postsStore';

const TEXT_LIMIT = 220;

function truncate(text: string, limit: number) {
  const t = text.trim();
  if (t.length <= limit) return t;
  return t.slice(0, limit);
}

export const PostsCarousel = observer(() => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const navigate = useAppNavigate();
  const location = useLocation();

  const goToAllPosts = () => {
    saveScrollPosition(location.pathname);
    navigate('/posts');
  };

  useEffect(() => {
    void postsStore.loadLatest(5);
  }, []);

  const items = postsStore.latest.items;

  const canScroll = useMemo(() => items.length > 0, [items.length]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(`.${styles.card}`);
    const step = (card?.offsetWidth ?? 320) + 16;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Актуальные посты и новости</h2>

          <div className={styles.controls}>
            <button
              className={styles.arrow}
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScroll || postsStore.latest.loading}
              aria-label="Листать влево"
            >
              ←
            </button>
            <button
              className={styles.arrow}
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScroll || postsStore.latest.loading}
              aria-label="Листать вправо"
            >
              →
            </button>
          </div>
        </div>

        {postsStore.latest.error && <div className={styles.error}>{postsStore.latest.error}</div>}

        <div className={styles.scroller} ref={scrollerRef}>
          {postsStore.latest.loading && items.length === 0 ? (
            <div className={styles.skeletonRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : (
            items.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.card}
                onClick={() => {
                  saveScrollPosition(location.pathname);
                  navigate(`/posts/${p.id}`);
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>{p.title}</div>
                  <div className={styles.cardDate}>
                    {new Date(p.publishedAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                    })}
                  </div>
                </div>

                <div className={styles.previewWrap}>
                  <p className={styles.previewText}>{truncate(p.content, TEXT_LIMIT)}</p>
                  <div className={styles.fade} />
                </div>
              </button>
            ))
          )}
        </div>
        <div className={styles.footerRow}>
          <button className={styles.allButton} type="button" onClick={goToAllPosts}>
            Смотреть все посты
          </button>
        </div>
      </div>
    </section>
  );
});