// src/pages/shop/ui/ShopCatalogPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { shopCartStore } from '@/features/shop/model/shopCartStore';
import { shopCatalogStore } from '@/features/shop/model/shopCatalogStore';
import { shopFavoritesStore } from '@/features/shop/model/shopFavoritesStore';
import {
    CatalogFilters,
    CatalogPagination,
    ProductCard,
} from '@/features/shop/ui';

import styles from './ShopCatalogPage.module.css';

export const ShopCatalogPage = observer(() => {
    const {
        filters,
        products,
        total,
        error,
        isLoading,
        isInitialized,
    } = shopCatalogStore;

    const categoriesKey = filters.categories.join('|');

    useEffect(() => {
        void shopCatalogStore.load();
    }, [
        filters.search,
        filters.minPrice,
        filters.maxPrice,
        filters.onlyAvailable,
        filters.sort,
        filters.page,
        filters.limit,
        categoriesKey,
    ]);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.breadcrumbs}>
                    <Link to="/" className={styles.breadcrumbLink}>
                        Главная
                    </Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.breadcrumbCurrent}>Магазин</span>
                </div>

                <header className={styles.hero}>
                    <div>
                        <h1 className={styles.title}>Магазин Tailly</h1>
                        <p className={styles.subtitle}>
                            Корм, игрушки, аксессуары и товары для ухода за питомцами.
                        </p>
                    </div>

                    <div className={styles.quickStats}>
                        <Link to="/shop/favorites" className={styles.quickCard}>
                            <span className={styles.quickCardValue}>{shopFavoritesStore.total}</span>
                            <span className={styles.quickCardLabel}>В избранном</span>
                        </Link>

                        <Link to="/shop/cart" className={styles.quickCard}>
                            <span className={styles.quickCardValue}>{shopCartStore.totalItems}</span>
                            <span className={styles.quickCardLabel}>В корзине</span>
                        </Link>
                    </div>
                </header>

                <div className={styles.layout}>
                    <div className={styles.sidebar}>
                        <CatalogFilters />
                    </div>

                    <section className={styles.content}>
                        <div className={styles.toolbar}>
                            <div className={styles.results}>
                                {isLoading && !isInitialized ? 'Загрузка каталога...' : `Найдено товаров: ${total}`}
                            </div>

                            <div className={styles.currentPage}>
                                Страница {filters.page} из {shopCatalogStore.totalPages}
                            </div>
                        </div>

                        {error ? (
                            <div className={styles.stateCard}>
                                <h2 className={styles.stateTitle}>Не удалось загрузить каталог</h2>
                                <p className={styles.stateText}>{error}</p>
                                <button
                                    className={styles.retryButton}
                                    type="button"
                                    onClick={() => {
                                        void shopCatalogStore.load();
                                    }}
                                >
                                    Повторить
                                </button>
                            </div>
                        ) : null}

                        {!error && isLoading && !isInitialized ? (
                            <div className={styles.stateCard}>
                                <h2 className={styles.stateTitle}>Загружаем товары</h2>
                                <p className={styles.stateText}>
                                    Подготавливаем каталог и применяем выбранные фильтры.
                                </p>
                            </div>
                        ) : null}
                        {!error && isInitialized && products.length === 0 ? (
                            <div className={styles.stateCard}>
                                <h2 className={styles.stateTitle}>Ничего не найдено</h2>
                                <p className={styles.stateText}>
                                    Попробуй изменить фильтры, диапазон цены или строку поиска.
                                </p>
                                <button
                                    className={styles.retryButton}
                                    type="button"
                                    onClick={() => shopCatalogStore.resetFilters()}
                                >
                                    Сбросить фильтры
                                </button>
                            </div>
                        ) : null}

                        {!error && products.length > 0 ? (
                            <>
                                <div className={styles.grid}>
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                <div className={styles.paginationWrap}>
                                    <CatalogPagination />
                                </div>
                            </>
                        ) : null}
                    </section>
                </div>
            </div>
        </div>
    );
});