// src/pages/shop/ui/ShopProductPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { shopProductStore } from '@/features/shop/model/shopProductStore';
import {
  ProductBackButton,
  ProductDescription,
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
  const reviewsAnchorRef = useRef<HTMLDivElement | null>(null);

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
  const state = (location.state ?? null) as ShopProductPageLocationState | null;
  const from = state?.from;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <ProductBackButton from={from} />
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
            <section className={styles.hero}>
              <div className={styles.galleryCol}>
                <ProductGallery images={product.images} productTitle={product.title} />
              </div>

              <div className={styles.infoCol}>
                <ProductPurchasePanel
                  product={product}
                  onReviewsClick={handleScrollToReviews}
                />
              </div>
            </section>

            <section className={styles.details}>
              <ProductDescription product={product} />

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
