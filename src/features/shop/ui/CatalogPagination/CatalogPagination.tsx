// src/features/shop/ui/CatalogPagination/CatalogPagination.tsx
import { observer } from 'mobx-react-lite';

import styles from './CatalogPagination.module.css';
import { shopCatalogStore } from '../../model/shopCatalogStore';

export const CatalogPagination = observer(() => {
  const { filters, totalPages } = shopCatalogStore;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label="Пагинация каталога">
      <button
        className={styles.navButton}
        type="button"
        onClick={() => shopCatalogStore.setPage(filters.page - 1)}
        disabled={filters.page <= 1}
        aria-label="Предыдущая страница"
      >
        ←
      </button>

      <div className={styles.pageText}>Страница {filters.page} из {totalPages}</div>

      <button
        className={styles.navButton}
        type="button"
        onClick={() => shopCatalogStore.setPage(filters.page + 1)}
        disabled={filters.page >= totalPages}
        aria-label="Следующая страница"
      >
        →
      </button>
    </nav>
  );
});
