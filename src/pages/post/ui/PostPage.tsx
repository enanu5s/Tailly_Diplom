//src/pages/post/ui/PostPage.tsx

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, Link } from 'react-router-dom';
import { postsStore } from '@/features/posts/model/postsStore';
import styles from './PostPage.module.css';

export const PostPage = observer(() => {
  const { postId } = useParams();

  useEffect(() => {
    if (postId) void postsStore.loadPostById(postId);
    return () => postsStore.resetDetails();
  }, [postId]);

  const { post, loading, error } = postsStore.details;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <Link className={styles.back} to="/posts">
            ← Назад к постам
          </Link>
        </div>

        {loading && <div className={styles.state}>Загружаем пост...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {post && (
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.h1}>{post.title}</h1>
              <div className={styles.date}>
                {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                })}
              </div>
            </div>

            <div className={styles.contentGrid}>
              <div className={styles.text}>
                {post.content.split('\n').map((line, idx) => (
                  <p key={idx} className={styles.p}>
                    {line}
                  </p>
                ))}
              </div>

              <div className={styles.imageWrap}>
                {post.imageUrl ? (
                  <img className={styles.image} src={post.imageUrl} alt={post.title} />
                ) : (
                  <div className={styles.noImage}>Изображение отсутствует</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});