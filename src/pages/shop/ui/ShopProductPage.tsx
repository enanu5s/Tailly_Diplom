// src/pages/shop/ui/ShopProductPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { shopProductStore } from '@/features/shop/model/shopProductStore';
import {
  ProductBackButton,
  ProductGallery,
  ProductPurchasePanel,
  ProductReviews,
} from '@/features/shop/ui';

import styles from './ShopProductPage.module.css';

type ShopProductPageLocationState = {
  from?: {
    pathname: string;
    search: string;
    hash: string;
    scrollY: number;
    productId: string;
  };
};

export const ShopProductPage = observer(() => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { isSpecialist, user } = useAuth();
  const reviewsAnchorRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const purchasePanelColRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    void shopProductStore.loadBySlug(slug);

    return () => {
      shopProductStore.reset();
    };
  }, [slug]);

  const handleScrollToReviews = (): void => {
    reviewsAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const { product, isLoading, error } = shopProductStore;

  useEffect(() => {
    const hero = heroRef.current;
    const purchasePanelCol = purchasePanelColRef.current;

    if (!hero || !purchasePanelCol || !product) {
      return;
    }

    const syncPurchasePanelHeight = (): void => {
      hero.style.setProperty('--purchase-panel-height', `${purchasePanelCol.offsetHeight}px`);
    };

    syncPurchasePanelHeight();

    const resizeObserver = new ResizeObserver(syncPurchasePanelHeight);
    resizeObserver.observe(purchasePanelCol);

    return () => {
      resizeObserver.disconnect();
      hero.style.removeProperty('--purchase-panel-height');
    };
  }, [product]);
  const state = (location.state ?? null) as ShopProductPageLocationState | null;
  const from = state?.from;

  const productBackFallbackPath =
    isSpecialist && user?.specialistSlug?.trim()
      ? `/specialists/${user.specialistSlug.trim()}`
      : '/shop';

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <ProductBackButton from={from} fallbackPath={productBackFallbackPath} />
        </div>

        <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
          <Link className={styles.breadcrumbLink} to="/">
            Главная
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>

          <Link className={styles.breadcrumbLink} to="/shop">
            Магазин
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>

          <span className={styles.breadcrumbCurrent}>{product?.title ?? 'Товар'}</span>
        </nav>

        {isLoading ? (
          <section className={styles.stateCard}>
            <h1 className={styles.stateTitle}>Загружаем товар</h1>
            <p className={styles.stateText}>
              Подготавливаем подробную информацию о товаре.
            </p>
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className={styles.stateCard}>
            <h1 className={styles.stateTitle}>Не удалось открыть товар</h1>
            <p className={styles.stateText}>{error}</p>

            <div className={styles.stateActions}>
              <Link className={styles.backLinkButton} to="/shop">
                Вернуться в каталог
              </Link>
            </div>
          </section>
        ) : null}

        {!isLoading && !error && product ? (
          <div className={styles.content}>
            <section className={styles.hero} ref={heroRef}>
              <div className={styles.galleryCol}>
                <ProductGallery images={product.images} productTitle={product.title} />
              </div>

              <div className={styles.infoCol} ref={purchasePanelColRef}>
                <ProductPurchasePanel
                  product={product}
                  onReviewsClick={handleScrollToReviews}
                />
              </div>
            </section>

            <section className={styles.details}>
              <div id="product-reviews" ref={reviewsAnchorRef}>
                <ProductReviews reviews={product.reviews} />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
});
