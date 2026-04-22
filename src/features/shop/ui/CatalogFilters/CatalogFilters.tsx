// src/features/shop/ui/CatalogFilters/CatalogFilters.tsx
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

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
    minCatalogPrice,
    maxCatalogPrice,
    isMetaLoading,
    isMetaInitialized,
  } = shopCatalogStore;

  const minPriceValue = useMemo(
    () => (filters.minPrice === null ? '' : String(filters.minPrice)),
    [filters.minPrice],
  );

  const maxPriceValue = useMemo(
    () => (filters.maxPrice === null ? '' : String(filters.maxPrice)),
    [filters.maxPrice],
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <label className={styles.label} htmlFor="shop-sort">
          Сортировка
        </label>

        <select
          id="shop-sort"
          className={styles.select}
          value={filters.sort}
          onChange={(event) => {
            shopCatalogStore.setSort(event.target.value as ProductSort);
          }}
        >
          {availableSorts.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </select>
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
        <div className={styles.priceHint}>
          Диапазон каталога: от {minCatalogPrice} до {maxCatalogPrice} ₽
        </div>

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