//src/features/posts/ui/PostsCarousel.tsx
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { saveScrollPosition } from '@/shared/lib/scroll';

import styles from './PostsCarousel.module.css';
import { getPostGalleryUrls } from '../lib/postGallery';
import { postsStore } from '../model/postsStore';

import type { Post } from '../model/types';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function PostCardImage({ post }: { post: Post }) {
  const urls = getPostGalleryUrls(post);
  const imageUrl = urls[0];

  if (!imageUrl) {
    return <div className={styles.imageFallback} aria-hidden="true" />;
  }

  return <img className={styles.cardImage} src={imageUrl} alt="" loading="lazy" />;
}

function PostTags({ post }: { post: Post }) {
  const tags = post.tags ?? [];

  if (tags.length === 0) {
    return <div className={styles.tagsPlaceholder} />;
  }

  return (
    <div className={styles.tags}>
      {tags.slice(0, 3).map((tag) => (
        <span key={tag} className={styles.tag}>
          #{tag}
        </span>
      ))}
    </div>
  );
}

export const PostsCarousel = observer(() => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;

    if (!el) {
      return;
    }

    const computedStyle = window.getComputedStyle(el);
    const startInset = Number.parseFloat(computedStyle.paddingLeft) || 0;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const threshold = 2;
    const overflow = maxScrollLeft > threshold;

    setHasOverflow(overflow);
    setIsAtStart(!overflow || el.scrollLeft <= startInset + threshold);
    setIsAtEnd(!overflow || el.scrollLeft >= maxScrollLeft - threshold);
  }, []);

  const navigate = useAppNavigate();
  const location = useLocation();
  const items = postsStore.latest.items;

  useEffect(() => {
    void postsStore.loadLatest();
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [items.length, updateScrollState]);

  const canScroll = useMemo(() => items.length > 0, [items.length]);

  const goToAllPosts = () => {
    saveScrollPosition(location.pathname);
    navigate('/posts');
  };

  const openPost = (postId: string) => {
    saveScrollPosition(location.pathname);
    navigate(`/posts/${postId}`);
  };

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;

    if (!el) {
      return;
    }

    const card = el.querySelector<HTMLElement>(`.${styles.card}`);
    const step = (card?.offsetWidth ?? 596) + 20;

    el.scrollBy({ left: dir * step, behavior: 'smooth' });
    window.setTimeout(updateScrollState, 220);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Актуальные посты и новости</h2>

        {postsStore.latest.error && (
          <div className={styles.error}>{postsStore.latest.error}</div>
        )}

        <div
          className={`${styles.carousel} ${hasOverflow ? styles.hasOverflow : ''} ${
            isAtStart ? styles.atStart : ''
          } ${
            isAtEnd ? styles.atEnd : ''
          }`}
        >
          <div className={styles.scroller} ref={scrollerRef} onScroll={updateScrollState}>
            {postsStore.latest.loading && items.length === 0
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={styles.skeletonCard} />
                ))
              : items.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    className={styles.card}
                    onClick={() => openPost(post.id)}
                  >
                    <div className={styles.imageWrap}>
                      <PostCardImage post={post} />
                    </div>

                    <PostTags post={post} />

                    <h3 className={styles.cardTitle}>{post.title}</h3>

                    <div className={styles.previewWrap}>
                      <p className={styles.previewText}>{post.content.trim()}</p>
                      <span className={styles.fade} aria-hidden="true" />
                    </div>

                    <span className={styles.date}>{formatDate(post.publishedAt)}</span>
                  </button>
                ))}
          </div>

          <div className={styles.bottomControls}>
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScroll || postsStore.latest.loading}
              aria-label="Листать влево"
            >
              ←
            </button>

            <button className={styles.allButton} type="button" onClick={goToAllPosts}>
              Смотреть все посты и новости
            </button>

            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScroll || postsStore.latest.loading}
              aria-label="Листать вправо"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});
