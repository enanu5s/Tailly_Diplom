// src/features/admin-posts-banners-management/ui/AdminPostsBannersManagementSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, type ChangeEvent, type ReactElement } from 'react';

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
  AdminPostStatus,
  BannerLinkTarget,
  BannerPlacement,
} from '../model/types';

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

function getPostStatusLabel(status: AdminPostStatus): string {
  switch (status) {
    case 'published':
      return 'Опубликован';
    case 'archived':
      return 'В архиве';
    case 'draft':
    default:
      return 'Черновик';
  }
}

function getBannerStatusLabel(status: AdminBannerStatus): string {
  switch (status) {
    case 'published':
      return 'Активен';
    case 'archived':
      return 'В архиве';
    case 'draft':
    default:
      return 'Черновик';
  }
}

function getPlacementLabel(placement: BannerPlacement): string {
  switch (placement) {
    case 'home_hero':
      return 'Главная';
    case 'posts':
      return 'Посты';
    case 'specialists':
      return 'Специалисты';
    case 'shop':
      return 'Магазин';
    default:
      return placement;
  }
}

const POST_SORT_OPTIONS: { value: AdminPostsListSort; label: string }[] = [
  { value: 'updated_desc', label: 'Сначала недавно обновлённые' },
  { value: 'updated_asc', label: 'Сначала давно обновлённые' },
  { value: 'title_asc', label: 'Заголовок А → Я' },
  { value: 'title_desc', label: 'Заголовок Я → А' },
  { value: 'published_desc', label: 'По дате публикации (новые)' },
];

const BANNER_SORT_OPTIONS: { value: AdminBannersListSort; label: string }[] = [
  { value: 'updated_desc', label: 'Сначала недавно обновлённые' },
  { value: 'updated_asc', label: 'Сначала давно обновлённые' },
  { value: 'title_asc', label: 'Название А → Я' },
  { value: 'title_desc', label: 'Название Я → А' },
  { value: 'starts_desc', label: 'По началу показа (сначала поздние)' },
  { value: 'starts_asc', label: 'По началу показа (сначала ранние)' },
];

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

const PostEditorPanel = observer(
  ({
    onPostFilesChange,
  }: {
    onPostFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }): ReactElement => {
    const store = adminPostsBannersManagementStore;

    return (
      <div className={styles.editorPanel}>
        <h2 className={styles.editorTitle}>
          {store.postForm.id ? 'Редактирование публикации' : 'Новая публикация'}
        </h2>

        <label className={styles.field}>
          <span>Заголовок</span>
          <input
            value={store.postForm.title}
            onChange={(event) => store.setPostFormField('title', event.target.value)}
            placeholder="Введите заголовок публикации"
          />
        </label>

        <label className={styles.field}>
          <span>Текст</span>
          <textarea
            value={store.postForm.content}
            onChange={(event) => store.setPostFormField('content', event.target.value)}
            rows={10}
            placeholder="Введите текст публикации"
          />
        </label>

        <div className={styles.fieldGroup}>
          <label className={styles.field}>
            <span>Загрузить изображения с устройства</span>
            <input type="file" accept="image/*" multiple onChange={onPostFilesChange} />
          </label>

          <label className={styles.field}>
            <span>Добавить изображение по ссылке</span>
            <div className={styles.inlineField}>
              <input
                value={store.postForm.imageUrlInput}
                onChange={(event) =>
                  store.setPostFormField('imageUrlInput', event.target.value)
                }
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => store.addPostImageUrlFromInput()}
              >
                Добавить
              </button>
            </div>
          </label>
        </div>

        {store.isUploadingPostImages ? (
          <div className={styles.infoBox}>Загрузка изображений...</div>
        ) : null}

        {store.postForm.imageUrls.length > 0 ? (
          <div className={styles.galleryEditor}>
            <span className={styles.previewLabel}>Изображения публикации</span>

            <div className={styles.galleryGrid}>
              {store.postForm.imageUrls.map((imageUrl) => {
                const isCover = store.postForm.coverImageUrl === imageUrl;

                return (
                  <div key={imageUrl} className={styles.galleryCard}>
                    <img
                      className={styles.galleryImage}
                      src={imageUrl}
                      alt="Изображение публикации"
                    />

                    <div className={styles.galleryActions}>
                      <button
                        type="button"
                        className={
                          isCover
                            ? `${styles.secondaryButton} ${styles.coverButtonActive}`
                            : styles.secondaryButton
                        }
                        onClick={() => store.setPostCoverImage(imageUrl)}
                      >
                        {isCover ? 'Обложка' : 'Сделать обложкой'}
                      </button>

                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => store.removePostImage(imageUrl)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <label className={styles.field}>
          <span>Теги</span>
          <input
            value={store.postForm.tags}
            onChange={(event) => store.setPostFormField('tags', event.target.value)}
            placeholder="советы, уход, новости"
          />
        </label>

        <label className={styles.field}>
          <span>Статус</span>
          <select
            value={store.postForm.status}
            onChange={(event) =>
              store.setPostFormField('status', event.target.value as AdminPostStatus)
            }
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовать</option>
            <option value="archived">В архив</option>
          </select>
        </label>

        <div className={styles.editorActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => store.closePostEditor()}
            disabled={store.isSavingPost}
          >
            Отмена
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              void store.savePost();
            }}
            disabled={store.isSavingPost}
          >
            {store.isSavingPost ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    );
  },
);

const BannerEditorPanel = observer((): ReactElement => {
  const store = adminPostsBannersManagementStore;

  return (
    <div className={styles.editorPanel}>
      <h2 className={styles.editorTitle}>
        {store.bannerForm.id ? 'Редактирование баннера' : 'Новый баннер'}
      </h2>

      <label className={styles.field}>
        <span>Название</span>
        <input
          value={store.bannerForm.title}
          onChange={(event) => store.setBannerFormField('title', event.target.value)}
          placeholder="Введите название баннера"
        />
      </label>

      <label className={styles.field}>
        <span>Описание</span>
        <textarea
          value={store.bannerForm.description}
          onChange={(event) =>
            store.setBannerFormField('description', event.target.value)
          }
          rows={7}
          placeholder="Короткое описание назначения баннера"
        />
      </label>

      <label className={styles.field}>
        <span>Изображение</span>
        <input
          value={store.bannerForm.imageUrl}
          onChange={(event) => store.setBannerFormField('imageUrl', event.target.value)}
          placeholder="/images/banner-home.png"
        />
      </label>

      <label className={styles.field}>
        <span>Размещение</span>
        <select
          value={store.bannerForm.placement}
          onChange={(event) =>
            store.setBannerFormField('placement', event.target.value as BannerPlacement)
          }
        >
          <option value="home_hero">Главная</option>
          <option value="posts">Посты</option>
          <option value="specialists">Специалисты</option>
          <option value="shop">Магазин</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>Куда ведёт баннер</span>
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

      {store.bannerForm.linkTarget === 'posts' ? (
        <label className={styles.field}>
          <span>Пост для баннера</span>
          <select
            value={store.bannerForm.linkedPostId}
            onChange={(event) =>
              store.setBannerFormField('linkedPostId', event.target.value)
            }
          >
            <option value="">Выберите опубликованный пост</option>
            {store.posts
              .filter((post) => post.status === 'published')
              .map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
          </select>
        </label>
      ) : null}

      <label className={styles.field}>
        <span>Статус</span>
        <select
          value={store.bannerForm.status}
          onChange={(event) =>
            store.setBannerFormField('status', event.target.value as AdminBannerStatus)
          }
        >
          <option value="draft">Черновик</option>
          <option value="published">Активный</option>
          <option value="archived">В архив</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>Начало показа</span>
        <input
          type="datetime-local"
          value={store.bannerForm.startsAt}
          onChange={(event) => store.setBannerFormField('startsAt', event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span>Окончание показа</span>
        <input
          type="datetime-local"
          value={store.bannerForm.endsAt}
          onChange={(event) => store.setBannerFormField('endsAt', event.target.value)}
        />
      </label>

      <div className={styles.editorActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => store.closeBannerEditor()}
          disabled={store.isSavingBanner}
        >
          Отмена
        </button>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            void store.saveBanner();
          }}
          disabled={store.isSavingBanner}
        >
          {store.isSavingBanner ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
});

export const AdminPostsBannersManagementSection = observer((): ReactElement => {
  const store = adminPostsBannersManagementStore;

  useEffect(() => {
    void store.load();
  }, [store]);

  const handlePostFilesChange = (event: ChangeEvent<HTMLInputElement>): void => {
    void store.addPostImagesFromFiles(event.target.files);
    event.target.value = '';
  };

  const editingPostInFilteredList =
    Boolean(store.postForm.id) &&
    store.filteredPosts.some((p) => p.id === store.postForm.id);

  const showPostEditorFloating =
    store.isPostEditorOpen && (!store.postForm.id || !editingPostInFilteredList);

  const editingBannerInFilteredList =
    Boolean(store.bannerForm.id) &&
    store.filteredBanners.some((b) => b.id === store.bannerForm.id);

  const showBannerEditorFloating =
    store.isBannerEditorOpen && (!store.bannerForm.id || !editingBannerInFilteredList);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Администрирование контента</p>
          <h1 className={styles.title}>Посты и баннеры</h1>
          <p className={styles.description}>
            Здесь можно управлять публикациями и баннерами: создавать новые материалы,
            редактировать текущие, переводить их в черновики или архив. Список можно
            сузить поиском, фильтрами по статусу и размещению (для баннеров) и изменить
            порядок сортировки.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => {
              if (store.activeTab === 'posts') {
                store.startCreatePost();
                return;
              }

              store.startCreateBanner();
            }}
          >
            {store.activeTab === 'posts' ? 'Создать публикацию' : 'Создать баннер'}
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <article className={styles.statCard}>
          <span className={styles.statValue}>{store.posts.length}</span>
          <span className={styles.statLabel}>Всего публикаций</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statValue}>{store.publishedPostsCount}</span>
          <span className={styles.statLabel}>Опубликовано</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statValue}>{store.banners.length}</span>
          <span className={styles.statLabel}>Всего баннеров</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statValue}>{store.publishedBannersCount}</span>
          <span className={styles.statLabel}>Активных баннеров</span>
        </article>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={
                store.activeTab === 'posts'
                  ? `${styles.tabButton} ${styles.tabButtonActive}`
                  : styles.tabButton
              }
              onClick={() => store.setActiveTab('posts')}
            >
              Публикации
            </button>

            <button
              type="button"
              className={
                store.activeTab === 'banners'
                  ? `${styles.tabButton} ${styles.tabButtonActive}`
                  : styles.tabButton
              }
              onClick={() => store.setActiveTab('banners')}
            >
              Баннеры
            </button>
          </div>

          <label className={styles.searchField}>
            <span>Поиск</span>
            <input
              value={store.search}
              onChange={(event) => store.setSearch(event.target.value)}
              placeholder={
                store.activeTab === 'posts'
                  ? 'Заголовок, текст, теги'
                  : 'Название, описание, размещение, ссылка'
              }
              type="search"
              autoComplete="off"
            />
          </label>
        </div>

        {store.activeTab === 'posts' ? (
          <div className={styles.filterRow}>
            <label className={styles.filterField}>
              <span>Статус</span>
              <select
                className={styles.filterSelect}
                value={store.postStatusFilter}
                onChange={(event) =>
                  store.setPostStatusFilter(event.target.value as 'all' | AdminPostStatus)
                }
              >
                <option value="all">Все</option>
                <option value="draft">Черновик</option>
                <option value="published">Опубликован</option>
                <option value="archived">В архиве</option>
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Сортировка</span>
              <select
                className={styles.filterSelect}
                value={store.postSort}
                onChange={(event) =>
                  store.setPostSort(event.target.value as AdminPostsListSort)
                }
              >
                {POST_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className={styles.filterRow}>
            <label className={styles.filterField}>
              <span>Статус</span>
              <select
                className={styles.filterSelect}
                value={store.bannerStatusFilter}
                onChange={(event) =>
                  store.setBannerStatusFilter(
                    event.target.value as 'all' | AdminBannerStatus,
                  )
                }
              >
                <option value="all">Все</option>
                <option value="draft">Черновик</option>
                <option value="published">Активен</option>
                <option value="archived">В архиве</option>
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Размещение</span>
              <select
                className={styles.filterSelect}
                value={store.bannerPlacementFilter}
                onChange={(event) =>
                  store.setBannerPlacementFilter(
                    event.target.value as 'all' | BannerPlacement,
                  )
                }
              >
                <option value="all">Все площадки</option>
                <option value="home_hero">{getPlacementLabel('home_hero')}</option>
                <option value="posts">{getPlacementLabel('posts')}</option>
                <option value="specialists">{getPlacementLabel('specialists')}</option>
                <option value="shop">{getPlacementLabel('shop')}</option>
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Сортировка</span>
              <select
                className={styles.filterSelect}
                value={store.bannerSort}
                onChange={(event) =>
                  store.setBannerSort(event.target.value as AdminBannersListSort)
                }
              >
                {BANNER_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <p className={styles.filterMeta}>
          {store.activeTab === 'posts'
            ? `Показано публикаций: ${store.filteredPosts.length} из ${store.posts.length}`
            : `Показано баннеров: ${store.filteredBanners.length} из ${store.banners.length}`}
        </p>
      </div>

      {store.actionError ? (
        <div className={styles.errorBox}>{store.actionError}</div>
      ) : null}

      {store.successMessage ? (
        <div className={styles.successBox}>{store.successMessage}</div>
      ) : null}

      {store.isLoading ? (
        <div className={styles.infoBox}>Загрузка контента...</div>
      ) : null}

      {!store.isLoading && store.loadError ? (
        <div className={styles.errorBox}>{store.loadError}</div>
      ) : null}

      {!store.isLoading && !store.loadError && store.activeTab === 'posts' ? (
        <div className={styles.contentGrid}>
          {showPostEditorFloating ? (
            <div className={styles.gridRow}>
              <div className={styles.cardColumn}>
                {store.postForm.id ? (
                  <div className={styles.editorRowPlaceholder}>
                    <span className={styles.editorRowPlaceholderTitle}>
                      Редактирование
                    </span>
                    <p className={styles.editorRowPlaceholderText}>
                      Эта публикация сейчас не попадает под фильтры списка. Карточка
                      скрыта — форма справа относится к выбранной записи.
                    </p>
                  </div>
                ) : (
                  <div className={styles.editorRowPlaceholder}>
                    <span className={styles.editorRowPlaceholderTitle}>
                      Новая публикация
                    </span>
                    <p className={styles.editorRowPlaceholderText}>
                      Заполните форму справа. После сохранения материал появится в списке.
                    </p>
                  </div>
                )}
              </div>
              <div className={styles.editorColumn}>
                <PostEditorPanel onPostFilesChange={handlePostFilesChange} />
              </div>
            </div>
          ) : null}

          {store.filteredPosts.length === 0 && !store.isPostEditorOpen ? (
            <div className={styles.emptyStateFull}>
              Публикации по текущему фильтру не найдены.
            </div>
          ) : null}

          {store.filteredPosts.map((post: AdminManagedPost) => (
            <div key={post.id} className={styles.gridRow}>
              <div className={styles.cardColumn}>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.cardTitle}>{post.title}</h2>
                      <p className={styles.cardMeta}>
                        {getPostStatusLabel(post.status)} · обновлено{' '}
                        {formatDateTime(post.updatedAt)}
                      </p>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => store.startEditPost(post)}
                      >
                        Редактировать
                      </button>

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
                    </div>
                  </div>

                  <p className={styles.cardText}>{post.content}</p>

                  <dl className={styles.detailsGrid}>
                    <div>
                      <dt>Теги</dt>
                      <dd>{post.tags.length ? post.tags.join(', ') : '—'}</dd>
                    </div>
                    <div>
                      <dt>Дата публикации</dt>
                      <dd>{formatDateTime(post.publishedAt)}</dd>
                    </div>
                    <div>
                      <dt>Изображений</dt>
                      <dd>{post.imageUrls.length}</dd>
                    </div>
                  </dl>

                  {post.coverImageUrl ? (
                    <div className={styles.previewBlock}>
                      <span className={styles.previewLabel}>Обложка</span>
                      <img
                        className={styles.previewImage}
                        src={post.coverImageUrl}
                        alt={post.title}
                      />
                    </div>
                  ) : null}
                </article>
              </div>
              <div className={styles.editorColumn}>
                {store.isPostEditorOpen && store.postForm.id === post.id ? (
                  <PostEditorPanel onPostFilesChange={handlePostFilesChange} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!store.isLoading && !store.loadError && store.activeTab === 'banners' ? (
        <div className={styles.contentGrid}>
          {showBannerEditorFloating ? (
            <div className={styles.gridRow}>
              <div className={styles.cardColumn}>
                {store.bannerForm.id ? (
                  <div className={styles.editorRowPlaceholder}>
                    <span className={styles.editorRowPlaceholderTitle}>
                      Редактирование
                    </span>
                    <p className={styles.editorRowPlaceholderText}>
                      Этот баннер сейчас не попадает под фильтры списка. Форма справа
                      относится к выбранной записи.
                    </p>
                  </div>
                ) : (
                  <div className={styles.editorRowPlaceholder}>
                    <span className={styles.editorRowPlaceholderTitle}>Новый баннер</span>
                    <p className={styles.editorRowPlaceholderText}>
                      Заполните форму справа.
                    </p>
                  </div>
                )}
              </div>
              <div className={styles.editorColumn}>
                <BannerEditorPanel />
              </div>
            </div>
          ) : null}

          {store.filteredBanners.length === 0 && !store.isBannerEditorOpen ? (
            <div className={styles.emptyStateFull}>
              Баннеры по текущему фильтру не найдены.
            </div>
          ) : null}

          {store.filteredBanners.map((banner: AdminManagedBanner) => (
            <div key={banner.id} className={styles.gridRow}>
              <div className={styles.cardColumn}>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.cardTitle}>{banner.title}</h2>
                      <p className={styles.cardMeta}>
                        {getBannerStatusLabel(banner.status)} ·{' '}
                        {getPlacementLabel(banner.placement)}
                      </p>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => store.startEditBanner(banner)}
                      >
                        Редактировать
                      </button>

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
                    </div>
                  </div>

                  <p className={styles.cardText}>{banner.description}</p>

                  <dl className={styles.detailsGrid}>
                    <div>
                      <dt>Куда ведёт</dt>
                      <dd>
                        {banner.linkTarget === 'posts' && banner.linkedPostId
                          ? `Пост: ${
                              store.posts.find((post) => post.id === banner.linkedPostId)
                                ?.title ?? banner.linkedPostId
                            }`
                          : getBannerLinkTargetLabel(banner.linkTarget)}
                      </dd>
                    </div>
                    <div>
                      <dt>Период показа</dt>
                      <dd>
                        {formatDateTime(banner.startsAt)} —{' '}
                        {formatDateTime(banner.endsAt)}
                      </dd>
                    </div>
                    <div>
                      <dt>Технический путь</dt>
                      <dd>{banner.linkUrl || '—'}</dd>
                    </div>
                  </dl>

                  {banner.imageUrl ? (
                    <div className={styles.previewBlock}>
                      <span className={styles.previewLabel}>Изображение</span>
                      <img
                        className={styles.previewImage}
                        src={banner.imageUrl}
                        alt={banner.title}
                      />
                    </div>
                  ) : null}
                </article>
              </div>
              <div className={styles.editorColumn}>
                {store.isBannerEditorOpen && store.bannerForm.id === banner.id ? (
                  <BannerEditorPanel />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
});
