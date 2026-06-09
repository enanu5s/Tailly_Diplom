// src/shared/ui/static-page/StaticPageLayout.tsx
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './StaticPageLayout.module.css';

type Props = {
  title: string;
  children: React.ReactNode;
};

export const StaticPageLayout = ({ title, children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const state = location.state as
      | {
          from?: {
            pathname?: string;
            scrollY?: number;
          };
        }
      | null;

    const fromPath = state?.from?.pathname;
    const fromScrollY = state?.from?.scrollY;

    if (fromPath) {
      // Предпочитаем исторический "назад": так сохраняется точный уровень скролла.
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }

      void fromScrollY;
      navigate(fromPath);
      return;
    }

    navigate(-1);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backButton} type="button" onClick={handleBack}>
          <span className={styles.backIcon}>←</span>
          Назад
        </button>

        <h1 className={styles.title}>{title}</h1>

        <article className={styles.card}>{children}</article>
      </div>
    </main>
  );
};