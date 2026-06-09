// src/features/posts/ui/PostsList.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { saveScrollPosition } from '@/shared/lib/scroll';

import { getPostGalleryUrls } from '../lib/postGallery';
import { postsStore } from '../model/postsStore';

import styles from './PostsList.module.css';

import type { Post, PostsSort } from '../model/types';

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

function PostPreviewImage({ post }: { post: Post }) {
  const urls = getPostGalleryUrls(post);
  const [firstUrl] = urls;
  const extraCount = Math.max(0, urls.length - 1);

  if (!firstUrl) {
    return <div className={styles.imagePlaceholder} aria-hidden="true" />;
  }

  return (
    <div className={styles.imageWrap}>
      <img className={styles.image} src={firstUrl} alt="" loading="lazy" />

      {extraCount > 0 ? (
        <span className={styles.extraBadge}>+{extraCount}</span>
      ) : null}
    </div>
  );
}

export const PostsList = observer(() => {
  const navigate = useAppNavigate();

  useEffect(() => {
    void postsStore.loadList();
  }, []);

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void postsStore.loadList();
  };

  const handleSortChange = (value: string): void => {
    postsStore.setSort(value as PostsSort);
  };

  const handlePostClick = (postId: string): void => {
    saveScrollPosition('/posts');
    navigate(`/posts/${postId}`);
  };

  return (
    <div className={styles.root}>
      <form className={styles.controls} onSubmit={onSearchSubmit}>
        <input
          className={styles.search}
          type="text"
          placeholder="Поиск по постам и новостям..."
          value={postsStore.list.search}
          onChange={(event) => postsStore.setSearch(event.target.value)}
        />

        <select
          className={styles.select}
          value={postsStore.list.sort}
          onChange={(event) => handleSortChange(event.target.value)}
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
          <option value="title_asc">По названию А–Я</option>
          <option value="title_desc">По названию Я–А</option>
        </select>

        <button
          className={styles.searchBtn}
          type="submit"
          disabled={postsStore.list.loading}
        >
          {postsStore.list.loading ? 'Ищем...' : 'Найти'}
        </button>
      </form>

      {postsStore.list.availableTags.length > 0 ? (
        <section className={styles.tagsSection}>
          <div className={styles.tagsHeader}>
            <span className={styles.tagsTitle}>Популярные темы</span>
          </div>

          <div className={styles.tagsList}>
            <button
              type="button"
              className={
                postsStore.list.selectedTag === ''
                  ? `${styles.tagButton} ${styles.tagButtonActive}`
                  : styles.tagButton
              }
              onClick={() => postsStore.setSelectedTag('')}
              disabled={postsStore.list.loading}
            >
              Все темы
            </button>

            {postsStore.list.availableTags.map((tag) => {
              const isActive = postsStore.list.selectedTag === tag;

              return (
                <button
                  key={tag}
                  type="button"
                  className={
                    isActive
                      ? `${styles.tagButton} ${styles.tagButtonActive}`
                      : styles.tagButton
                  }
                  onClick={() => postsStore.setSelectedTag(tag)}
                  disabled={postsStore.list.loading}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {postsStore.list.error ? (
        <div className={styles.error}>{postsStore.list.error}</div>
      ) : null}

      {!postsStore.list.loading && postsStore.list.items.length === 0 ? (
        <div className={styles.emptyState}>По текущим параметрам посты не найдены.</div>
      ) : null}

      <div className={styles.grid}>
        {postsStore.list.loading && postsStore.list.items.length === 0
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeleton} />
            ))
          : postsStore.list.items.map((post) => (
              <button
                key={post.id}
                type="button"
                className={styles.card}
                onClick={() => handlePostClick(post.id)}
              >
                <PostPreviewImage post={post} />

                {post.tags && post.tags.length > 0 ? (
                  <div className={styles.cardTags}>
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className={styles.cardTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <h2 className={styles.cardTitle}>{post.title}</h2>

                <div className={styles.cardTextWrap}>
                  <p className={styles.cardText}>{post.content}</p>
                  <div className={styles.fade} />
                </div>

                <time className={styles.cardDate} dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </button>
            ))}
      </div>

      <div className={styles.pagination}>
        <button
          className={`${styles.pageBtn} ${styles.pageBtnPrev}`}
          type="button"
          onClick={() => {
            postsStore.setListPage(postsStore.list.page - 1);
            void postsStore.loadList();
          }}
          disabled={postsStore.list.loading || postsStore.list.page <= 1}
          aria-label="Предыдущая страница"
        >
          ←
        </button>

        <div className={styles.pageInfo}>
          Страница {postsStore.list.page} из {postsStore.totalPages}
        </div>

        <button
          className={`${styles.pageBtn} ${styles.pageBtnNext}`}
          type="button"
          onClick={() => {
            postsStore.setListPage(postsStore.list.page + 1);
            void postsStore.loadList();
          }}
          disabled={
            postsStore.list.loading || postsStore.list.page >= postsStore.totalPages
          }
          aria-label="Следующая страница"
        >
          →
        </button>
      </div>
    </div>
  );
});