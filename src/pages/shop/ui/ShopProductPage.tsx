// src/pages/shop/ui/ShopProductPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
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

    const { product, isLoading, error } = shopProductStore;
    const state = (location.state ?? null) as ShopProductPageLocationState | null;
    const from = state?.from;

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

                    <span className={styles.breadcrumbCurrent}>
                        {product?.title ?? 'Товар'}
                    </span>
                </div>

                {isLoading ? (
                    <div className={styles.stateCard}>
                        <h1 className={styles.stateTitle}>Загружаем товар</h1>
                        <p className={styles.stateText}>
                            Подготавливаем подробную информацию о товаре.
                        </p>
                    </div>
                ) : null}

                {!isLoading && error ? (
                    <div className={styles.stateCard}>
                        <h1 className={styles.stateTitle}>Не удалось открыть товар</h1>
                        <p className={styles.stateText}>{error}</p>

                        <div className={styles.stateActions}>
                            <Link to="/shop" className={styles.backLinkButton}>
                                Вернуться в каталог
                            </Link>
                        </div>
                    </div>
                ) : null}

                {!isLoading && !error && product ? (
                    <div className={styles.content}>
                        <section className={styles.hero}>
                            <div className={styles.galleryCol}>
                                <ProductGallery
                                    images={product.images}
                                    productTitle={product.title}
                                />
                            </div>

                            <div className={styles.infoCol}>
                                <ProductPurchasePanel product={product} />
                            </div>
                        </section>

                        <div className={styles.details}>
                            <ProductDescription product={product} />
                            <ProductReviews reviews={product.reviews} />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
});