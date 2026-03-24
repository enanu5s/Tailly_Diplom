// src/features/shop/ui/CatalogPagination/CatalogPagination.tsx
import { observer } from 'mobx-react-lite';

import styles from './CatalogPagination.module.css';
import { shopCatalogStore } from '../../model/shopCatalogStore';

export const CatalogPagination = observer(() => {
  const { filters, totalPages } = shopCatalogStore;

  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(filters.page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Пагинация каталога">
      <button
        className={styles.navButton}
        type="button"
        onClick={() => shopCatalogStore.setPage(filters.page - 1)}
        disabled={filters.page <= 1}
      >
        Назад
      </button>

      <div className={styles.pages}>
        {pages.map((page, index) =>
          page === 'dots' ? (
            <span key={`dots - ${index}`} className={styles.dots}>
              …
            </span>
          ) : (
            <button
              key={page}
              className={`${styles.pageButton} ${page === filters.page ? styles.pageButtonActive : ''}`}
              type="button"
              onClick={() => shopCatalogStore.setPage(page)}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        className={styles.navButton}
        type="button"
        onClick={() => shopCatalogStore.setPage(filters.page + 1)}
        disabled={filters.page >= totalPages}
      >
        Вперёд
      </button>
    </nav>
  );
});

function buildPages(current: number, total: number): Array<number | 'dots'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 'dots', total];
  }

  if (current >= total - 2) {
    return [1, 'dots', total - 3, total - 2, total - 1, total];
  }

  return [1, 'dots', current - 1, current, current + 1, 'dots', total];
}
