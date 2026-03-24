import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { getPostGalleryUrls } from '@/features/posts/lib/postGallery';
import { postsStore } from '@/features/posts/model/postsStore';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './PostPage.module.css';

type PostPageLocationState = {
  from?: 'home' | 'posts';
};

const FALLBACK_HERO_BACKGROUND =
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #0f172a 100%)';

export const PostPage = observer(() => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useAppNavigate();
  const location = useLocation();

  const state = (location.state ?? null) as PostPageLocationState | null;
  const from = state?.from;

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
    navigate(-1);
  };

  const handleGoToPosts = (): void => {
    navigate('/posts');
  };

  const { loading, error, post } = postsStore.details;

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
              className={styles.secondaryButton}
              onClick={handleGoToPosts}
            >
              Назад к постам
            </button>
          </div>
        </div>
      </section>
    );
  }

  const galleryUrls = getPostGalleryUrls(post);
  const heroImage = galleryUrls[0];
  const extraGalleryUrls = galleryUrls.slice(1);

  const heroStyle = heroImage
    ? {
        backgroundImage: `url(${heroImage})`,
      }
    : {
        backgroundImage: FALLBACK_HERO_BACKGROUND,
      };

  const isFromHome = from === 'home';

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.actions}>
          {isFromHome ? (
            <>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleGoBack}
              >
                Назад
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleGoToPosts}
              >
                К другим постам
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleGoToPosts}
            >
              Назад к постам
            </button>
          )}
        </div>

        <article className={styles.article}>
          <div className={styles.hero} style={heroStyle}>
            <div className={styles.heroOverlay}>
              <div className={styles.meta}>
                <span className={styles.date}>
                  {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <h1 className={styles.title}>{post.title}</h1>
            </div>
          </div>

          {extraGalleryUrls.length > 0 ? (
            <div className={styles.gallery}>
              <h2 className={styles.galleryTitle}>Галерея</h2>
              <div className={styles.galleryGrid}>
                {extraGalleryUrls.map((url, index) => (
                  <figure key={`${url}-${index}`} className={styles.galleryFigure}>
                    <img
                      className={styles.galleryImage}
                      src={url}
                      alt={`Иллюстрация «${post.title}», ${index + 2} из ${galleryUrls.length}`}
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.content}>
            {post.content.split('\n').map((paragraph, index) => {
              const normalized = paragraph.trim();

              if (!normalized) {
                return <div key={`space-${index}`} className={styles.spacer} />;
              }

              return (
                <p key={`paragraph-${index}`} className={styles.paragraph}>
                  {normalized}
                </p>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
});
