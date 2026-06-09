// src/features/shop/ui/CatalogPagination/CatalogPagination.tsx
import { observer } from 'mobx-react-lite';

import { PaginationNav } from '@/shared/ui/pagination-nav';

import { shopCatalogStore } from '../../model/shopCatalogStore';

export const CatalogPagination = observer(() => {
  const { filters, totalPages } = shopCatalogStore;

  return (
    <PaginationNav
      page={filters.page}
      totalPages={totalPages}
      onPageChange={(next) => {
        shopCatalogStore.setPage(next);
      }}
      ariaLabel="Пагинация каталога"
    />
  );
});
