import { observer } from 'mobx-react-lite';
import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useParams } from 'react-router-dom';

import { getPostGalleryUrls } from '@/features/posts/lib/postGallery';
import { postsStore } from '@/features/posts/model/postsStore';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './PostPage.module.css';

type PostPageLocationState = {
  from?: 'home' | 'posts';
};

const FALLBACK_HERO_BACKGROUND =
  'linear-gradient(135deg, #fff3cd 0%, #c7c2ba 45%, #211500 100%)';

const VISIBLE_GALLERY_COUNT = 3;

export const PostPage = observer(() => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useAppNavigate();
  const location = useLocation();

  const state = (location.state ?? null) as PostPageLocationState | null;
  const from = state?.from;
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!postId) {
      return;
    }

    void postsStore.loadPostById(postId);

    return () => {
      postsStore.resetDetails();
    };
  }, [postId]);

  const handleGoBack = (): void => {
    if (from === 'home') {
      navigate(-1);
      return;
    }

    navigate('/posts');
  };

  const handleGoToPosts = (): void => {
    navigate('/posts');
  };

  const { loading, error, post } = postsStore.details;
  const galleryUrls = post ? getPostGalleryUrls(post) : [];
  const allImages = galleryUrls;
  const heroImage = galleryUrls[0];
  const galleryImages = galleryUrls.slice(1);
  const visibleGalleryImages = galleryImages.slice(0, VISIBLE_GALLERY_COUNT);
  const hiddenGalleryCount = Math.max(galleryImages.length - VISIBLE_GALLERY_COUNT, 0);
  const canOpenGalleryModal = allImages.length > 0;
  const isModalOpen = activeImageIndex !== null;
  const currentImageIndex = activeImageIndex ?? 0;
  const hasPrevImage = currentImageIndex > 0;
  const hasNextImage = currentImageIndex < allImages.length - 1;

  const handleOpenImageModal = useCallback((index: number): void => {
    if (!canOpenGalleryModal) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, allImages.length - 1));
    setActiveImageIndex(safeIndex);
  }, [allImages.length, canOpenGalleryModal]);

  const handleCloseImageModal = useCallback((): void => {
    setActiveImageIndex(null);
  }, []);

  const handlePrevImage = useCallback((): void => {
    if (!hasPrevImage) {
      return;
    }

    setActiveImageIndex(currentImageIndex - 1);
  }, [currentImageIndex, hasPrevImage]);

  const handleNextImage = useCallback((): void => {
    if (!hasNextImage) {
      return;
    }

    setActiveImageIndex(currentImageIndex + 1);
  }, [currentImageIndex, hasNextImage]);

  const heroStyle: CSSProperties = {
    backgroundImage: heroImage ? `url("${heroImage}")` : FALLBACK_HERO_BACKGROUND,
  };

  const paragraphs = (post?.content ?? '')
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handleCloseImageModal();
      }
      if (event.key === 'ArrowLeft') {
        handlePrevImage();
      }
      if (event.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isModalOpen, handleCloseImageModal, handleNextImage, handlePrevImage]);

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateBlock}>Загрузка поста...</div>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateBlock}>
            <p className={styles.stateText}>{error ?? 'Пост не найден'}</p>

            <button
              type="button"
              className={styles.backButton}
              onClick={handleGoToPosts}
            >
              Назад к постам
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.actions}>
          <button type="button" className={styles.backButton} onClick={handleGoBack}>
            Назад к постам
          </button>

          {from === 'home' ? (
            <button
              type="button"
              className={styles.postsButton}
              onClick={handleGoToPosts}
            >
              К другим постам
            </button>
          ) : null}
        </div>

        <article className={styles.article}>
          <header
            className={styles.hero}
            style={heroStyle}
            onClick={canOpenGalleryModal ? () => handleOpenImageModal(0) : undefined}
          >
            <div className={styles.heroOverlay}>
              <time className={styles.date} dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
              </time>

              <h1 className={styles.title}>{post.title}</h1>
            </div>
          </header>

          {galleryImages.length > 0 ? (
            <section className={styles.gallery}>
              <h2 className={styles.galleryTitle}>Галерея</h2>

              <div className={styles.galleryGrid}>
                {visibleGalleryImages.map((url, index) => (
                  <figure key={`${url}-${index}`} className={styles.galleryFigure}>
                    <img
                      className={styles.galleryImage}
                      src={url}
                      alt={`Иллюстрация «${post.title}», ${index + 1}`}
                      loading="lazy"
                      onClick={() => handleOpenImageModal(index + 1)}
                    />
                  </figure>
                ))}

                {hiddenGalleryCount > 0 ? (
                  <button
                    type="button"
                    className={styles.moreGallery}
                    onClick={() => handleOpenImageModal(1 + VISIBLE_GALLERY_COUNT)}
                  >
                    +{hiddenGalleryCount}
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          <div className={styles.content}>
            {paragraphs.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>

      {isModalOpen && allImages.length > 0
        ? createPortal(
            <div
              className={styles.viewerOverlay}
              onClick={handleCloseImageModal}
              role="dialog"
              aria-modal="true"
              aria-label="Просмотр фотографий поста"
            >
              <div className={styles.viewerModal} onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className={styles.viewerClose}
                  onClick={handleCloseImageModal}
                  aria-label="Закрыть"
                >
                  ✕
                </button>

                <div className={styles.viewerContent}>
                  <aside className={styles.viewerThumbs} aria-label="Миниатюры">
                    {allImages.map((url, index) => (
                      <button
                        type="button"
                        key={`${url}-${index}`}
                        className={`${styles.viewerThumbButton} ${
                          index === currentImageIndex ? styles.viewerThumbButtonActive : ''
                        }`}
                        onClick={() => handleOpenImageModal(index)}
                        aria-label={`Открыть фото ${index + 1}`}
                      >
                        <img
                          className={styles.viewerThumbImage}
                          src={url}
                          alt={`Миниатюра ${index + 1}`}
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </aside>

                  <div className={styles.viewerMain}>
                    <img
                      className={styles.viewerMainImage}
                      src={allImages[currentImageIndex]}
                      alt={`Фото «${post.title}», ${currentImageIndex + 1}`}
                    />

                    <div className={styles.viewerControls}>
                      <button
                        type="button"
                        className={styles.viewerArrow}
                        onClick={handlePrevImage}
                        disabled={!hasPrevImage}
                        aria-label="Предыдущее фото"
                      >
                        ←
                      </button>
                      <div className={styles.viewerCounter}>
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                      <button
                        type="button"
                        className={styles.viewerArrow}
                        onClick={handleNextImage}
                        disabled={!hasNextImage}
                        aria-label="Следующее фото"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
});