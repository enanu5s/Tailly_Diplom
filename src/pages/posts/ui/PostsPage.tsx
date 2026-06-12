import { useEffect } from 'react';

import { PostsList } from '@/features/posts/ui/PostsList';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { consumeScrollPosition } from '@/shared/lib/scroll';

import styles from './PostsPage.module.css';

export const PostsPage = () => {
  const navigate = useAppNavigate();

  useEffect(() => {
    const y = consumeScrollPosition('/posts');

    window.scrollTo({
      top: y ?? 0,
      left: 0,
      behavior: 'auto',
    });
  }, []);

  const handleBack = (): void => {
    navigate('/about', { replace: true });
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <button className={styles.back} type="button" onClick={handleBack}>
            Назад
          </button>
          <h1 className={styles.h1}>Посты и новости</h1>
        </header>

        <PostsList />
      </div>
    </main>
  );
};