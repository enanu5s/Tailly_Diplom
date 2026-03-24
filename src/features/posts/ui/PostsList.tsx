// src/features/posts/ui/PostsList.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { saveScrollPosition } from '@/shared/lib/scroll';

import styles from './PostsList.module.css';
import { getPostGalleryUrls } from '../lib/postGallery';
import { postsStore } from '../model/postsStore';

import type { Post, PostsSort } from '../model/types';

function PostListThumbs({ post }: { post: Post }) {
  const urls = getPostGalleryUrls(post);

  if (urls.length === 0) {
    return null;
  }

  return (
    <div className={styles.listThumbScroller}>
      {urls.map((url, index) => (
        <div key={`${url}-${index}`} className={styles.listThumb}>
          <img src={url} alt="" loading="lazy" />
        </div>
      ))}
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

  return (
    <div className={styles.root}>
      <form className={styles.controls} onSubmit={onSearchSubmit}>
        <input
          className={styles.search}
          type="text"
          placeholder="Поиск по постам..."
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
          <option value="title_asc">По названию (А–Я)</option>
          <option value="title_desc">По названию (Я–А)</option>
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
        <div className={styles.tagsSection}>
          <div className={styles.tagsHeader}>
            <span className={styles.tagsTitle}>Темы</span>

            {postsStore.hasActiveFilters ? (
              <button
                type="button"
                className={styles.clearFiltersButton}
                onClick={() => postsStore.clearFilters()}
                disabled={postsStore.list.loading}
              >
                Сбросить фильтры
              </button>
            ) : null}
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
        </div>
      ) : null}

      {postsStore.list.error ? (
        <div className={styles.error}>{postsStore.list.error}</div>
      ) : null}

      {!postsStore.list.loading && postsStore.list.items.length === 0 ? (
        <div className={styles.emptyState}>
          По текущим параметрам посты не найдены.
        </div>
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
                onClick={() => {
                  saveScrollPosition('/posts');
                  navigate(`/posts/${post.id}`);
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>{post.title}</div>
                  <div className={styles.cardDate}>
                    {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                    })}
                  </div>
                </div>

                {post.tags && post.tags.length > 0 ? (
                  <div className={styles.cardTags}>
                    {post.tags.map((tag) => (
                      <span key={tag} className={styles.cardTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <PostListThumbs post={post} />

                <div className={styles.cardTextWrap}>
                  <p className={styles.cardText}>{post.content}</p>
                  <div className={styles.fade} />
                </div>
              </button>
            ))}
      </div>

      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => {
            postsStore.setListPage(postsStore.list.page - 1);
            void postsStore.loadList();
          }}
          disabled={postsStore.list.loading || postsStore.list.page <= 1}
        >
          ← Назад
        </button>

        <div className={styles.pageInfo}>
          Страница {postsStore.list.page} из {postsStore.totalPages}
        </div>

        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => {
            postsStore.setListPage(postsStore.list.page + 1);
            void postsStore.loadList();
          }}
          disabled={
            postsStore.list.loading ||
            postsStore.list.page >= postsStore.totalPages
          }
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
});