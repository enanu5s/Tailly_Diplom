// src/features/shop/ui/CatalogFilters/CatalogFilters.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './CatalogFilters.module.css';
import { shopCatalogStore } from '../../model/shopCatalogStore';

import type { ProductSort } from '../../model/types';

const SORT_LABELS: Record<ProductSort, string> = {
  popular: 'По популярности',
  newest: 'Сначала новые',
  'rating-desc': 'По рейтингу',
  'price-asc': 'Сначала дешевле',
  'price-desc': 'Сначала дороже',
};

export const CatalogFilters = observer(() => {
  const {
    filters,
    categories,
    availableSorts,
    isMetaLoading,
    isMetaInitialized,
  } = shopCatalogStore;

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  const minPriceValue = useMemo(
    () => (filters.minPrice === null ? '' : String(filters.minPrice)),
    [filters.minPrice],
  );

  const maxPriceValue = useMemo(
    () => (filters.maxPrice === null ? '' : String(filters.maxPrice)),
    [filters.maxPrice],
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (!sortRef.current) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!sortRef.current.contains(target)) {
        setIsSortOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedSortLabel = SORT_LABELS[filters.sort];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <label className={styles.label}>Сортировка</label>

        <div
          ref={sortRef}
          className={`${styles.customSelect} ${isSortOpen ? styles.customSelectOpen : ''}`}
        >
          <button
            type="button"
            className={styles.customSelectTrigger}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            aria-label="Сортировка товаров"
            onClick={() => {
              setIsSortOpen((current) => !current);
            }}
          >
            <span className={styles.customSelectValue}>{selectedSortLabel}</span>
            <span className={styles.customSelectArrow} aria-hidden="true">
              ▾
            </span>
          </button>

          {isSortOpen ? (
            <div className={styles.customSelectMenu} role="listbox" aria-label="Варианты сортировки">
              {availableSorts.map((sort) => {
                const isActive = filters.sort === sort;

                return (
                  <button
                    key={sort}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`${styles.customSelectOption} ${
                      isActive ? styles.customSelectOptionActive : ''
                    }`}
                    onClick={() => {
                      shopCatalogStore.setSort(sort);
                      setIsSortOpen(false);
                    }}
                  >
                    {SORT_LABELS[sort]}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.checkboxItem}>
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(event) => {
              shopCatalogStore.setOnlyAvailable(event.target.checked);
            }}
          />
          <span>Только в наличии</span>
        </label>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Категория</div>

        {isMetaLoading && !isMetaInitialized ? (
          <div className={styles.metaHint}>Загружаем категории...</div>
        ) : (
          <div className={styles.checkboxList}>
            {categories.map((category) => {
              const checked = filters.categoryIds.includes(category.id);

              return (
                <label key={category.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      shopCatalogStore.setCategory(category.id, event.target.checked);
                    }}
                  />
                  <span>{category.title}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Цена</div>

        <div className={styles.priceGrid}>
          <input
            className={styles.input}
            type="number"
            min="0"
            inputMode="numeric"
            value={minPriceValue}
            onChange={(event) => {
              const value = event.target.value.trim();
              const nextValue = value === '' ? null : Number(value);
              shopCatalogStore.setMinPrice(nextValue);
            }}
            placeholder="От"
          />

          <input
            className={styles.input}
            type="number"
            min="0"
            inputMode="numeric"
            value={maxPriceValue}
            onChange={(event) => {
              const value = event.target.value.trim();
              const nextValue = value === '' ? null : Number(value);
              shopCatalogStore.setMaxPrice(nextValue);
            }}
            placeholder="До"
          />
        </div>
      </div>

      <button
        className={styles.resetButton}
        type="button"
        onClick={() => {
          shopCatalogStore.resetFilters();
        }}
      >
        Сбросить фильтр
      </button>
    </aside>
  );
});