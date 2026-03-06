// src/features/shop/ui/CatalogFilters/CatalogFilters.tsx
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { shopCatalogStore } from '../../model/shopCatalogStore';
import type { ProductSort } from '../../model/types';

import styles from './CatalogFilters.module.css';

const SORT_LABELS: Record<ProductSort, string> = {
    popular: 'Сначала популярные',
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
                <label className={styles.label} htmlFor="shop-search">
                    Поиск
                </label>

                <input
                    id="shop-search"
                    className={styles.input}
                    type="text"
                    value={filters.search}
                    onChange={(event) => {
                        console.log('[CatalogFilters] search changed:', event.target.value);
                        shopCatalogStore.setSearch(event.target.value);
                    }}
                    placeholder="Например: корм, миска, шампунь"
                />
            </div>

            <div className={styles.section}>
                <div className={styles.label}>Категории</div>

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
                                            console.log('[CatalogFilters] category toggle:', {
                                                categoryId: category.id,
                                                categoryTitle: category.title,
                                                checked: event.target.checked,
                                                before: filters.categoryIds,
                                            });

                                            shopCatalogStore.setCategory(category.id, event.target.checked);

                                            console.log('[CatalogFilters] categoryIds after toggle call:', shopCatalogStore.filters.categoryIds);
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

                            console.log('[CatalogFilters] minPrice changed:', nextValue);
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
                            console.log('[CatalogFilters] maxPrice changed:', nextValue);
                            shopCatalogStore.setMaxPrice(nextValue);
                        }}
                        placeholder="До"
                    />
                </div>
            </div>

            <div className={styles.section}>
                <label className={styles.checkboxItem}>
                    <input
                        type="checkbox"
                        checked={filters.onlyAvailable}
                        onChange={(event) => {
                            console.log('[CatalogFilters] onlyAvailable changed:', event.target.checked);
                            shopCatalogStore.setOnlyAvailable(event.target.checked);
                        }}
                    />
                    <span>Только в наличии</span>
                </label>
            </div>

            <div className={styles.section}>
                <label className={styles.label} htmlFor="shop-sort">
                    Сортировка
                </label>

                <select
                    id="shop-sort"
                    className={styles.select}
                    value={filters.sort}
                    onChange={(event) => {
                        console.log('[CatalogFilters] sort changed:', event.target.value);
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

            <button
                className={styles.resetButton}
                type="button"
                onClick={() => {
                    console.log('[CatalogFilters] reset filters');
                    shopCatalogStore.resetFilters();
                }}
            >
                Сбросить фильтры
            </button>
        </aside>
    );
});