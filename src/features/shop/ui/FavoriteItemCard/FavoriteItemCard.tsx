// src/features/shop/ui/FavoriteItemCard/FavoriteItemCard.tsx
import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';

import styles from './FavoriteItemCard.module.css';
import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';

import type { Product } from '../../model/types';


type Props = {
    product: Product;
};

type ProductPageNavigationState = {
    from?: {
        pathname: string;
        search: string;
        hash: string;
        scrollY: number;
        productId: string;
    };
};

export const FavoriteItemCard = observer(({ product }: Props) => {
    const location = useLocation();
    const { user } = useAuth();
    const showConsumerControls = shouldShowShopConsumerControls(user);
    const quantity = shopCartStore.getQuantity(product.id);
    const mainImage = product.images[0];

    const productLinkState: ProductPageNavigationState = {
        from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            scrollY: window.scrollY,
            productId: product.id,
        },
    };

    const handleRemoveFromFavorites = (): void => {
        shopFavoritesStore.remove(product.id);
    };

    const handleAddToCart = (): void => {
        if (!product.isAvailable) {
            return;
        }

        shopCartStore.add(product.id, 1);
    };

    const handleIncrement = (): void => {
        if (!product.isAvailable || quantity >= product.stockQuantity) {
            return;
        }

        shopCartStore.increment(product.id);
    };

    const handleDecrement = (): void => {
        shopCartStore.decrement(product.id);
    };

    return (
        <article
            className={styles.card}
            data-shop-product-id={product.id}
            id={`shop - favorite - card - ${product.id}`}
        >
            <Link
                to={`/shop/${product.slug}`}
                state={productLinkState}
                className={styles.imageLink}
            >
                {
                    mainImage ? (
                        <img
                            className={styles.image}
                            src={mainImage.url}
                            alt={mainImage.alt}
                            loading="lazy"
                        />
                    ) : (
                        <div className={styles.imagePlaceholder} > Нет изображения</div >
                    )}
            </Link >

            <div className={styles.content}>
                <div className={styles.topRow}>
                    <div className={styles.meta}>
                        <div className={styles.category}>{product.categoryTitle}</div>

                        <Link
                            to={`/shop/${product.slug}`}
                            state={productLinkState}
                            className={styles.titleLink}
                        >
                            <h3 className={styles.title}>{product.title}</h3>
                        </Link>

                        <p className={styles.description}>{product.shortDescription}</p>
                    </div>

                    {showConsumerControls ? (
                        <button
                            className={styles.removeButton}
                            type="button"
                            onClick={handleRemoveFromFavorites}
                        >
                            Удалить
                        </button>
                    ) : null}
                </div>

                <div className={styles.bottomRow}>
                    <div className={styles.priceBlock}>
                        <span className={styles.price}>{formatPrice(product.price)}</span>
                        {product.oldPrice !== null ? (
                            <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
                        ) : null}
                    </div>

                    {showConsumerControls ? (
                        <div className={styles.actions}>
                            {quantity > 0 ? (
                                <div className={styles.quantityControl}>
                                    <button
                                        className={styles.quantityButton}
                                        type="button"
                                        onClick={handleDecrement}
                                        aria-label="Уменьшить количество"
                                    >
                                        −
                                    </button>

                                    <span className={styles.quantityValue}>{quantity}</span>
                                    <button
                                        className={styles.quantityButton}
                                        type="button"
                                        onClick={handleIncrement}
                                        aria-label="Увеличить количество"
                                        disabled={quantity >= product.stockQuantity}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className={styles.cartButton}
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={!product.isAvailable}
                                >
                                    В корзину
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>

                {
                    !product.isAvailable ? (
                        <div className={styles.unavailable}>Товар сейчас недоступен для заказа</div>
                    ) : null
                }
            </div >
        </article >
    );
});

function formatPrice(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value);
}