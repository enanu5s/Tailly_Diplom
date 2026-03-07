// src/pages/shop/ui/ShopCatalogPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { shopCartStore } from '@/features/shop/model/shopCartStore';
import { shopCatalogStore } from '@/features/shop/model/shopCatalogStore';
import { shopFavoritesStore } from '@/features/shop/model/shopFavoritesStore';
import {
    CatalogFilters,
    CatalogPagination,
    ProductCard,
} from '@/features/shop/ui';

import styles from './ShopCatalogPage.module.css';

type ShopCatalogPageLocationState = {
    restoreScrollY?: number;
    restoreProductId?: string;
};

export const ShopCatalogPage = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();
    const restoredRef = useRef(false);

    const {
        filters,
        products,
        total,
        error,
        isLoading,
        isInitialized,
    } = shopCatalogStore;

    const categoryIdsKey = filters.categoryIds.join('|');

    useEffect(() => {
        if (!shopCatalogStore.isMetaInitialized && !shopCatalogStore.isMetaLoading) {
            void shopCatalogStore.loadMeta();
        }
    }, []);

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
        categoryIdsKey,
    ]);

    useEffect(() => {
        const state = (location.state ?? null) as ShopCatalogPageLocationState | null;

        if (!state || restoredRef.current) {
            return;
        }

        if (!isInitialized || isLoading) {
            return;
        }

        const restoreToProduct = (): boolean => {
            if (!state.restoreProductId) {
                return false;
            }

            const element = document.querySelector<HTMLElement>(
                `[data-shop-product-id="${state.restoreProductId}"]`,
            );

            if (!element) {
                return false;
            }

            element.scrollIntoView({
                block: 'center',
                behavior: 'auto',
            });

            return true;
        };

        const timerId = window.setTimeout(() => {
            const restoredByProduct = restoreToProduct();

            if (!restoredByProduct && typeof state.restoreScrollY === 'number') {
                window.scrollTo({
                    top: state.restoreScrollY,
                    behavior: 'auto',
                });
            }

            restoredRef.current = true;

            navigate(location.pathname + location.search + location.hash, {
                replace: true,
                state: null,
            });
        }, 0);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [
        isInitialized,
        isLoading,
        location.hash,
        location.pathname,
        location.search,
        location.state,
        navigate,
        products,
    ]);

    useEffect(() => {
        restoredRef.current = false;
    }, [
        filters.search,
        filters.minPrice,
        filters.maxPrice,
        filters.onlyAvailable,
        filters.sort,
        filters.page,
        filters.limit,
        categoryIdsKey,
    ]);

    const cartLinkState = {
        from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            scrollY: window.scrollY,
            productId: '',
        },
    };

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
                        <Link to="/shop/cart" state={cartLinkState} className={styles.quickCard}>
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

                        {shopCatalogStore.metaError ? (
                            <div className={styles.metaWarning}>
                                Не удалось загрузить метаданные каталога: {shopCatalogStore.metaError}
                            </div>
                        ) : null}

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
                                    Попробуй изменить запрос, фильтры или диапазон цены.
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