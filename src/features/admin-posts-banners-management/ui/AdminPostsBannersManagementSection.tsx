// src/features/admin-posts-banners-management/ui/AdminPostsBannersManagementSection.tsx
import { observer } from 'mobx-react-lite';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './AdminPostsBannersManagementSection.module.css';
import {
  adminPostsBannersManagementStore,
  type AdminBannersListSort,
  type AdminPostsListSort,
} from '../model/adminPostsBannersManagementStore';

import type {
  AdminBannerStatus,
  AdminManagedBanner,
  AdminManagedPost,
  BannerLinkTarget,
  BannerPlacement,
} from '../model/types';

const POST_SORT_OPTIONS: { value: AdminPostsListSort; label: string }[] = [
  { value: 'updated_desc', label: 'Сначала новые' },
  { value: 'updated_asc', label: 'Сначала старые' },
  { value: 'title_asc', label: 'От а до я' },
  { value: 'title_desc', label: 'От я до а' },
];

const BANNER_SORT_OPTIONS: { value: AdminBannersListSort; label: string }[] = [
  { value: 'updated_desc', label: 'Сначала новые' },
  { value: 'updated_asc', label: 'Сначала старые' },
  { value: 'title_asc', label: 'От а до я' },
  { value: 'title_desc', label: 'От я до а' },
];

function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getBannerLinkTargetLabel(linkTarget: BannerLinkTarget): string {
  switch (linkTarget) {
    case 'home':
      return 'Главная страница';
    case 'posts':
      return 'Раздел постов';
    case 'specialists':
      return 'Каталог специалистов';
    case 'shop':
      return 'Магазин';
    case 'profile':
      return 'Профиль пользователя';
    default:
      return linkTarget;
  }
}

function getBannerLinkLabel(banner: AdminManagedBanner, posts: AdminManagedPost[]): string {
  if (banner.linkTarget === 'posts' && banner.linkedPostId) {
    return `/posts/${banner.linkedPostId}`;
  }

  if (banner.linkUrl) {
    return banner.linkUrl;
  }

  if (banner.linkTarget === 'posts' && banner.linkedPostId) {
    return posts.find((post) => post.id === banner.linkedPostId)?.title ?? banner.linkedPostId;
  }

  return getBannerLinkTargetLabel(banner.linkTarget);
}

function normalizeDateTimeInputValue(value: string): string {
  if (!value) {
    return '';
  }

  if (value.includes('T')) {
    return value.slice(0, 16);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getCardImage(post: AdminManagedPost): string | undefined {
  return post.coverImageUrl || post.imageUrls[0];
}

function isPostEdited(post: AdminManagedPost): boolean {
  const createdAt = new Date(post.createdAt).getTime();
  const updatedAt = new Date(post.updatedAt).getTime();

  if (Number.isNaN(createdAt) || Number.isNaN(updatedAt)) {
    return false;
  }

  return updatedAt > createdAt;
}

function formatBannerRange(banner: AdminManagedBanner): string {
  const startsAt = banner.startsAt ?? banner.createdAt;
  const endsAt = banner.endsAt ?? startsAt;
  return `${formatDate(startsAt)} — ${formatDate(endsAt)}`;
}

function PostTextPreview({ text }: { text: string }): ReactElement {
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const node = textRef.current;
    if (!node) {
      return;
    }

    const updateOverflowState = (): void => {
      setIsOverflowing(node.scrollHeight > node.clientHeight + 1);
    };

    updateOverflowState();
    window.addEventListener('resize', updateOverflowState);

    return () => {
      window.removeEventListener('resize', updateOverflowState);
    };
  }, [text]);

  const textClassName = isOverflowing
    ? `${styles.postText} ${styles.postTextOverflowing}`
    : styles.postText;

  return (
    <p ref={textRef} className={textClassName}>
      {text}
    </p>
  );
}

const PostEditorModal = observer(
  ({
    onPostFilesChange,
  }: {
    onPostFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }): ReactElement => {
    const store = adminPostsBannersManagementStore;
    const selectedTags = store.postForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const toggleTag = (tag: string): void => {
      const nextTags = selectedTags.includes(tag)
        ? selectedTags.filter((item) => item !== tag)
        : [...selectedTags, tag];

      store.setPostFormField('tags', nextTags.join(', '));
    };

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.postModal} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.modalCloseButton}
            aria-label="Закрыть"
            onClick={() => store.closePostEditor()}
            disabled={store.isSavingPost}
          />

          <h2 className={styles.modalTitle}>
            {store.postForm.id ? 'Редактирование поста' : 'Создание нового поста'}
          </h2>

          <label className={styles.modalField}>
            <span>Заголовок</span>
            <input
              value={store.postForm.title}
              onChange={(event) => store.setPostFormField('title', event.target.value)}
              placeholder="Введите заголовок для поста"
            />
          </label>

          <label className={styles.modalField}>
            <span>Текст</span>
            <textarea
              value={store.postForm.content}
              onChange={(event) => store.setPostFormField('content', event.target.value)}
              placeholder="Введите текст поста"
            />
          </label>

          <div className={styles.modalField}>
            <span>Тема(ы) поста</span>
            <div className={styles.topicGrid}>
              {store.postTagOptions.map((tag) => {
                const isActive = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    className={isActive ? styles.topicButtonActive : styles.topicButton}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.modalField}>
            <span>Фотографии</span>

            <label className={styles.coverUploader}>
              <input
                className={styles.fileInput}
                type="file"
                accept="image/*"
                onChange={onPostFilesChange}
              />

              {store.postForm.coverImageUrl ? (
                <img
                  className={styles.coverPreview}
                  src={store.postForm.coverImageUrl}
                  alt="Обложка поста"
                />
              ) : (
                <span className={styles.coverUploaderContent}>
                  <strong>Загрузите обложку поста</strong>
                  <small>Минимальный размер фотографии 1520х460</small>
                  <span>Выбрать файл</span>
                </span>
              )}
            </label>
          </div>

          <div className={styles.photoGrid}>
            <label className={styles.photoUploadCard}>
              <input
                className={styles.fileInput}
                type="file"
                accept="image/*"
                multiple
                onChange={onPostFilesChange}
              />
              <strong>Загрузите фото</strong>
              <small>Максимум 5 фото</small>
              <span aria-hidden="true">+</span>
            </label>

            {store.postForm.imageUrls.slice(0, 4).map((imageUrl) => (
              <div key={imageUrl} className={styles.photoCard}>
                <img src={imageUrl} alt="Фото поста" />
                <button
                  type="button"
                  className={styles.photoDeleteButton}
                  aria-label="Удалить фото"
                  onClick={() => store.removePostImage(imageUrl)}
                >
                  <img src="/images/admin-posts/delete-28.svg" alt="" aria-hidden="true" />
                </button>
              </div>
            ))}

            {Array.from({
              length: Math.max(0, 4 - store.postForm.imageUrls.slice(0, 4).length),
            }).map((_, index) => (
              <div key={index} className={styles.photoPlaceholder} />
            ))}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.outlineButton}
              onClick={() => store.closePostEditor()}
              disabled={store.isSavingPost}
            >
              Отмена
            </button>

            <button
              type="button"
              className={styles.darkButton}
              onClick={() => {
                void store.savePost();
              }}
              disabled={store.isSavingPost}
            >
              {store.isSavingPost ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

const BannerEditorModal = observer((): ReactElement => {
  const store = adminPostsBannersManagementStore;

  const linkValue =
    store.bannerForm.linkTarget === 'posts' && store.bannerForm.linkedPostId
      ? `/posts/${store.bannerForm.linkedPostId}`
      : store.bannerForm.imageUrl;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.bannerModal} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.modalCloseButton}
          aria-label="Закрыть"
          onClick={() => store.closeBannerEditor()}
          disabled={store.isSavingBanner}
        />

        <h2 className={styles.modalTitle}>
          {store.bannerForm.id ? 'Редактирование баннера' : 'Создание нового баннера'}
        </h2>

        <label className={styles.modalField}>
          <span>Заголовок</span>
          <input
            value={store.bannerForm.title}
            onChange={(event) => store.setBannerFormField('title', event.target.value)}
            placeholder="Введите заголовок баннера"
          />
        </label>

        <label className={styles.modalField}>
          <span>Описание</span>
          <textarea
            className={styles.bannerDescriptionInput}
            value={store.bannerForm.description}
            onChange={(event) =>
              store.setBannerFormField('description', event.target.value)
            }
            placeholder="Введите описание"
          />
        </label>

        <div className={styles.modalField}>
          <span>Баннер</span>

          <label className={styles.bannerUploader}>
            <input
              className={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={() => undefined}
            />

            {store.bannerForm.imageUrl ? (
              <>
                <img
                  className={styles.bannerPreview}
                  src={store.bannerForm.imageUrl}
                  alt="Баннер"
                />
                <button
                  type="button"
                  className={styles.bannerDeleteButton}
                  aria-label="Удалить изображение баннера"
                  onClick={(event) => {
                    event.preventDefault();
                    store.setBannerFormField('imageUrl', '');
                  }}
                >
                  <img src="/images/admin-posts/delete-28.svg" alt="" aria-hidden="true" />
                </button>
              </>
            ) : (
              <span className={styles.coverUploaderContent}>
                <strong>Загрузите фотографию для баннера</strong>
                <small>Минимальный размер фотографии 1520х460</small>
                <span>Выбрать файл</span>
              </span>
            )}
          </label>
        </div>

        <div className={styles.bannerFieldsRow}>
          <label className={styles.modalField}>
            <span>Куда ведёт баннер (ссылка)</span>
            <input
              value={linkValue}
              onChange={(event) => {
                store.setBannerFormField('linkTarget', 'shop');
                store.setBannerFormField('imageUrl', event.target.value);
              }}
              placeholder="Введите ссылку, например: /shop/cat-food-premium-salmon"
            />
          </label>

          <label className={styles.modalField}>
            <span>Начало показа</span>
            <input
              type="datetime-local"
              value={normalizeDateTimeInputValue(store.bannerForm.startsAt)}
              onChange={(event) =>
                store.setBannerFormField('startsAt', event.target.value)
              }
            />
          </label>

          <label className={styles.modalField}>
            <span>Конец показа</span>
            <input
              type="datetime-local"
              value={normalizeDateTimeInputValue(store.bannerForm.endsAt)}
              onChange={(event) => store.setBannerFormField('endsAt', event.target.value)}
            />
          </label>
        </div>

        <div className={styles.hiddenBannerControls}>
          <label>
            <span>Размещение</span>
            <select
              value={store.bannerForm.placement}
              onChange={(event) =>
                store.setBannerFormField(
                  'placement',
                  event.target.value as BannerPlacement,
                )
              }
            >
              <option value="home_hero">Главная</option>
              <option value="posts">Посты</option>
              <option value="specialists">Специалисты</option>
              <option value="shop">Магазин</option>
            </select>
          </label>

          <label>
            <span>Статус</span>
            <select
              value={store.bannerForm.status}
              onChange={(event) =>
                store.setBannerFormField(
                  'status',
                  event.target.value as AdminBannerStatus,
                )
              }
            >
              <option value="draft">Черновик</option>
              <option value="published">Активный</option>
              <option value="archived">В архив</option>
            </select>
          </label>

          <label>
            <span>Куда ведёт</span>
            <select
              value={store.bannerForm.linkTarget}
              onChange={(event) =>
                store.setBannerFormField(
                  'linkTarget',
                  event.target.value as BannerLinkTarget | '',
                )
              }
            >
              <option value="">Выберите страницу</option>
              <option value="home">Главная страница</option>
              <option value="posts">Конкретный пост</option>
              <option value="specialists">Каталог специалистов</option>
              <option value="shop">Магазин</option>
              <option value="profile">Профиль пользователя</option>
            </select>
          </label>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.outlineButton}
            onClick={() => store.closeBannerEditor()}
            disabled={store.isSavingBanner}
          >
            Отмена
          </button>

          <button
            type="button"
            className={styles.darkButton}
            onClick={() => {
              void store.saveBanner();
            }}
            disabled={store.isSavingBanner}
          >
            {store.isSavingBanner ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
});

export const AdminPostsBannersManagementSection = observer((): ReactElement => {
  const store = adminPostsBannersManagementStore;
  const navigate = useNavigate();

  useEffect(() => {
    void store.load();
  }, [store]);

  useEffect(() => {
    if (!store.successMessage) {
      return;
    }

    const timeoutMs = store.hasPendingDeletion ? 10000 : 3500;
    const timeoutId = window.setTimeout(() => {
      store.clearSuccessMessage();
    }, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [store, store.successMessage, store.hasPendingDeletion]);

  const handlePostFilesChange = (event: ChangeEvent<HTMLInputElement>): void => {
    void store.addPostImagesFromFiles(event.target.files);
    event.target.value = '';
  };

  return (
    <section className={styles.section}>
      <button type="button" className={styles.backButton} onClick={() => navigate('/admin')}>
        <img
          className={styles.backButtonIcon}
          src="/images/admin-posts/arrow-up-24.svg"
          alt=""
          aria-hidden="true"
        />
        Назад
      </button>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Посты и баннеры</h1>

        <div className={styles.tabActions}>
          <button
            type="button"
            className={
              store.activeTab === 'posts'
                ? `${styles.tabPill} ${styles.tabPillActive}`
                : styles.tabPill
            }
            onClick={() => store.setActiveTab('posts')}
          >
            Посты
          </button>

          <button
            type="button"
            className={
              store.activeTab === 'banners'
                ? `${styles.tabPill} ${styles.tabPillActive}`
                : styles.tabPill
            }
            onClick={() => store.setActiveTab('banners')}
          >
            Баннеры
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            if (store.activeTab === 'posts') {
              store.startCreatePost();
              return;
            }

            store.startCreateBanner();
          }}
        >
          {store.activeTab === 'posts' ? 'Добавить пост' : 'Добавить баннер'}
        </button>

        <label className={styles.searchField}>
          <input
            value={store.search}
            onChange={(event) => store.setSearch(event.target.value)}
            placeholder="Поиск по заголовку"
            type="search"
            autoComplete="off"
          />
        </label>

        {store.activeTab === 'posts' ? (
          <select
            className={styles.sortSelect}
            value={store.postSort}
            onChange={(event) =>
              store.setPostSort(event.target.value as AdminPostsListSort)
            }
          >
            {POST_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            className={styles.sortSelect}
            value={store.bannerSort}
            onChange={(event) =>
              store.setBannerSort(event.target.value as AdminBannersListSort)
            }
          >
            {BANNER_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {store.actionError ? <div className={styles.errorBox}>{store.actionError}</div> : null}
      {store.successMessage ? (
        <div className={styles.successBox}>
          <span>{store.successMessage}</span>
          {store.hasPendingDeletion ? (
            <button
              type="button"
              className={styles.successUndoButton}
              onClick={() => store.undoPendingDeletion()}
            >
              Отменить
            </button>
          ) : null}
        </div>
      ) : null}
      {store.isLoading ? <div className={styles.infoBox}>Загрузка контента...</div> : null}
      {!store.isLoading && store.loadError ? (
        <div className={styles.errorBox}>{store.loadError}</div>
      ) : null}

      {!store.isLoading && !store.loadError && store.activeTab === 'posts' ? (
        <>
          {store.filteredPosts.length === 0 ? (
            <div className={styles.emptyState}>Публикации не найдены.</div>
          ) : (
            <div className={styles.cardsGrid}>
              {store.filteredPosts.map((post) => {
                const cardImage = getCardImage(post);

                return (
                  <article key={post.id} className={styles.postCard}>
                    {cardImage ? (
                      <img className={styles.postImage} src={cardImage} alt={post.title} />
                    ) : (
                      <div className={styles.postImageFallback} />
                    )}

                    <div className={styles.cardTags}>
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>

                    <h2 className={styles.postTitle}>{post.title}</h2>

                    <PostTextPreview text={post.content} />

                    <div className={styles.cardMetaRow}>
                      <span className={styles.dateBadge}>
                        {formatDate(post.publishedAt ?? post.createdAt)}
                      </span>
                      {isPostEdited(post) ? (
                        <span>обновлено {formatDateTime(post.updatedAt)}</span>
                      ) : null}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => {
                          void store.deletePost(post);
                        }}
                        disabled={store.deletingPostId === post.id}
                      >
                        {store.deletingPostId === post.id ? 'Удаление...' : 'Удалить'}
                      </button>

                      <button
                        type="button"
                        className={styles.darkButton}
                        onClick={() => store.startEditPost(post)}
                      >
                        Редактировать пост
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {!store.isLoading && !store.loadError && store.activeTab === 'banners' ? (
        <>
          {store.filteredBanners.length === 0 ? (
            <div className={styles.emptyState}>Баннеры не найдены.</div>
          ) : (
            <div className={styles.cardsGrid}>
              {store.filteredBanners.map((banner) => (
                <article key={banner.id} className={styles.bannerCard}>
                  {banner.imageUrl ? (
                    <img
                      className={styles.bannerImage}
                      src={banner.imageUrl}
                      alt={banner.title}
                    />
                  ) : (
                    <div className={styles.bannerImageFallback} />
                  )}

                  <span className={styles.dateBadge}>
                    {formatBannerRange(banner)}
                  </span>

                  <h2 className={styles.bannerTitle}>{banner.title}</h2>

                  <p className={styles.bannerText}>{banner.description}</p>

                  <p className={styles.bannerLink}>
                    <strong>Куда ведёт:</strong> {getBannerLinkLabel(banner, store.posts)}
                  </p>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => {
                        void store.deleteBanner(banner);
                      }}
                      disabled={store.deletingBannerId === banner.id}
                    >
                      {store.deletingBannerId === banner.id ? 'Удаление...' : 'Удалить'}
                    </button>

                    <button
                      type="button"
                      className={styles.darkButton}
                      onClick={() => store.startEditBanner(banner)}
                    >
                      Редактировать баннер
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : null}

      <div className={styles.pagination}>
        <button type="button" aria-label="Предыдущая страница" disabled>
          ←
        </button>
        <span>
          Страница 1 из{' '}
          {store.activeTab === 'posts' ? store.postsTotalPages : store.bannersTotalPages}
        </span>
        <button type="button" aria-label="Следующая страница">
          →
        </button>
      </div>

      {store.isPostEditorOpen ? (
        <PostEditorModal onPostFilesChange={handlePostFilesChange} />
      ) : null}

      {store.isBannerEditorOpen ? <BannerEditorModal /> : null}
    </section>
  );
});