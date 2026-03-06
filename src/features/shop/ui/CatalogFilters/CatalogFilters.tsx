// src/features/shop/ui/CatalogFilters/CatalogFilters.tsx
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { shopCatalogStore } from '../../model/shopCatalogStore';
import type { ProductCategory, ProductSort } from '../../model/types';

import styles from './CatalogFilters.module.css';

const CATEGORY_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
    { value: 'food', label: 'Корм' },
    { value: 'toys', label: 'Игрушки' },
    { value: 'care', label: 'Уход' },
    { value: 'accessories', label: 'Аксессуары' },
    { value: 'medicine', label: 'Здоровье' },
    { value: 'other', label: 'Другое' },
];

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
    { value: 'popular', label: 'Сначала популярные' },
    { value: 'newest', label: 'Сначала новые' },
    { value: 'rating-desc', label: 'По рейтингу' },
    { value: 'price-asc', label: 'Сначала дешевле' },
    { value: 'price-desc', label: 'Сначала дороже' },
];

export const CatalogFilters = observer(() => {
    const { filters } = shopCatalogStore;

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
                    onChange={(event) => shopCatalogStore.setSearch(event.target.value)}
                    placeholder="Название или описание товара"
                />
            </div>

            <div className={styles.section}>
                <div className={styles.label}>Категории</div>

                <div className={styles.checkboxList}>
                    {CATEGORY_OPTIONS.map((option) => {
                        const checked = filters.categories.includes(option.value);

                        return (
                            <label key={option.value} className={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) =>
                                        shopCatalogStore.setCategory(option.value, event.target.checked)
                                    }
                                />
                                <span>{option.label}</span>
                            </label>
                        );
                    })}
                </div>
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
                            shopCatalogStore.setMinPrice(value === '' ? null : Number(value));
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
                            shopCatalogStore.setMaxPrice(value === '' ? null : Number(value));
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
                        onChange={(event) => shopCatalogStore.setOnlyAvailable(event.target.checked)}
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
                    onChange={(event) =>
                        shopCatalogStore.setSort(event.target.value as ProductSort)
                    }
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <button
                className={styles.resetButton}
                type="button"
                onClick={() => shopCatalogStore.resetFilters()}
            >
                Сбросить фильтры
            </button>
        </aside>
    );
});