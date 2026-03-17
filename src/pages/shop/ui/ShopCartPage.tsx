// src/pages/shop/ui/ShopCartPage.tsx
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { reaction } from "mobx";

import { shopCartStore } from "@/features/shop/model/shopCartStore";
import { shopCartPageStore } from "@/features/shop/model/shopCartPageStore";
import {
  CartItemCard,
  CartSummary,
  ProductBackButton,
} from "@/features/shop/ui";

import styles from "./ShopCartPage.module.css";

type ShopCartPageLocationState = {
  from?: {
    pathname: string;
    search: string;
    hash: string;
    scrollY: number;
    productId: string;
  };
};

export const ShopCartPage = observer(() => {
  const location = useLocation();
  const state = (location.state ?? null) as ShopCartPageLocationState | null;
  const from = state?.from;

  const favoritesLinkState = {
    from: {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      scrollY: window.scrollY,
      productId: "",
    },
  };

  const checkoutLinkState = {
    from: {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      scrollY: window.scrollY,
      productId: "",
    },
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    void shopCartPageStore.load();

    return () => {
      shopCartPageStore.reset();
    };
  }, []);

  useEffect(() => {
    const dispose = reaction(
      () => shopCartStore.items.length,
      () => {
        void shopCartPageStore.load();
      },
    );

    return () => {
      dispose();
    };
  }, []);

  const {
    detailedItems,
    error,
    isEmpty,
    isInitialized,
    isLoading,
    itemsCount,
    totalPrice,
  } = shopCartPageStore;

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

          <span className={styles.breadcrumbCurrent}>Корзина</span>
        </div>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Корзина</h1>
            <p className={styles.subtitle}>
              Проверь выбранные товары перед оформлением заказа.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link
              to="/shop/favorites"
              state={favoritesLinkState}
              className={styles.secondaryLink}
            >
              Перейти в избранное
            </Link>

            {!isEmpty ? (
              <button
                className={styles.clearButton}
                type="button"
                onClick={() => {
                  shopCartStore.clear();
                }}
              >
                Очистить корзину
              </button>
            ) : null}
          </div>
        </header>

        {error ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Не удалось загрузить корзину</h2>
            <p className={styles.stateText}>{error}</p>
            <button
              className={styles.retryButton}
              type="button"
              onClick={() => {
                void shopCartPageStore.load();
              }}
            >
              Повторить
            </button>
          </div>
        ) : null}

        {!error && isLoading && !isInitialized ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Загружаем корзину</h2>
            <p className={styles.stateText}>
              Подготавливаем товары и итоговую сумму.
            </p>
          </div>
        ) : null}
        {!error && isInitialized && isEmpty ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Корзина пуста</h2>
            <p className={styles.stateText}>
              Добавь товары из каталога, чтобы перейти к оформлению заказа.
            </p>

            <Link to="/shop" className={styles.catalogButton}>
              Перейти в каталог
            </Link>
          </div>
        ) : null}

        {!error && detailedItems.length > 0 ? (
          <div className={styles.layout}>
            <section className={styles.items}>
              {detailedItems.map((item) => (
                <CartItemCard
                  key={item.product.id}
                  product={item.product}
                  quantity={item.quantity}
                />
              ))}
            </section>

            <div className={styles.summary}>
              <CartSummary
                itemsCount={itemsCount}
                totalPrice={totalPrice}
                checkoutLinkState={checkoutLinkState}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});
