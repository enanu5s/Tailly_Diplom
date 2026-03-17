import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { PostsList } from '@/features/posts/ui/PostsList';
import { consumeScrollPosition } from '@/shared/lib/scroll';

import styles from './PostsPage.module.css';


export const PostsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const y = consumeScrollPosition('/posts');
    if (y != null) {
      window.scrollTo({ top: y, left: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  const handleBack = () => {
    navigate('/about', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <button className={styles.back} type="button" onClick={handleBack}>
          ← Назад
        </button>
      </div>

      <div className={styles.container}>
        <h1 className={styles.h1}>Посты и новости</h1>
        <PostsList />
      </div>
    </div>
  );
};