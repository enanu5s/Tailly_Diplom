// src/shared/ui/pagination-nav/PaginationNav.tsx

import type { ReactElement } from 'react';

import styles from './PaginationNav.module.css';

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
};

export const PaginationNav = ({
  page,
  totalPages,
  onPageChange,
  ariaLabel,
}: Props): ReactElement | null => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      <button
        className={styles.navButton}
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Предыдущая страница"
      >
        <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" />
      </button>

      <div className={styles.pageText}>
        Страница {page} из {totalPages}
      </div>

      <button
        className={styles.navButton}
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Следующая страница"
      >
        <img src="/icons/arrow-right.svg" alt="" aria-hidden="true" />
      </button>
    </nav>
  );
};
