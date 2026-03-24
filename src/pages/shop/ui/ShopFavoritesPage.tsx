// src/pages/shop/ui/ShopFavoritesPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { shopFavoritesPageStore } from '@/features/shop/model/shopFavoritesPageStore';
import { shopFavoritesStore } from '@/features/shop/model/shopFavoritesStore';
import { FavoriteItemCard, ProductBackButton } from '@/features/shop/ui';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';

import styles from './ShopFavoritesPage.module.css';

type ShopFavoritesPageLocationState = {
  from?: {
    pathname: string;
    search: string;
    hash: string;
    scrollY: number;
    productId: string;
  };
};

export const ShopFavoritesPage = observer(() => {
  const location = useLocation();
  const { user } = useAuth();
  const state = (location.state ?? null) as ShopFavoritesPageLocationState | null;
  const from = state?.from;
  const showConsumerUi = shouldShowShopConsumerControls(user);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, []);

  useEffect(() => {
    if (!showConsumerUi) {
      return;
    }

    void shopFavoritesPageStore.load();

    return () => {
      shopFavoritesPageStore.reset();
    };
  }, [showConsumerUi]);

  const { displayProducts, error, isEmpty, isInitialized, isLoading } =
    shopFavoritesPageStore;

  if (!showConsumerUi) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <ProductBackButton from={from} fallbackPath="/shop" />
        </div>

        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>

          <Link to="/shop" className={styles.breadcrumbLink}>
            Магазин
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>

          <span className={styles.breadcrumbCurrent}>Избранное</span>
        </div>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Избранное</h1>
            <p className={styles.subtitle}>
              Сохрани понравившиеся товары и вернись к ним позже.
            </p>
          </div>

          {!isEmpty ? (
            <button
              className={styles.clearButton}
              type="button"
              onClick={() => {
                shopFavoritesStore.clear();
              }}
            >
              Очистить избранное
            </button>
          ) : null}
        </header>

        {error ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Не удалось загрузить избранное</h2>
            <p className={styles.stateText}>{error}</p>
            <button
              className={styles.retryButton}
              type="button"
              onClick={() => {
                void shopFavoritesPageStore.load();
              }}
            >
              Повторить
            </button>
          </div>
        ) : null}

        {!error && isLoading && !isInitialized ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Загружаем избранное</h2>
            <p className={styles.stateText}>Подготавливаем список сохранённых товаров.</p>
          </div>
        ) : null}

        {!error && isInitialized && isEmpty ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Избранное пока пусто</h2>
            <p className={styles.stateText}>
              Добавляй товары в избранное из каталога, карточки товара или корзины.
            </p>

            <Link to="/shop" className={styles.catalogButton}>
              Перейти в каталог
            </Link>
          </div>
        ) : null}

        {!error && displayProducts.length > 0 ? (
          <section className={styles.items}>
            {displayProducts.map((product) => (
              <FavoriteItemCard key={product.id} product={product} />
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
});
