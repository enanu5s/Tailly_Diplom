// src/features/shop/ui/CartItemCard/CartItemCard.tsx
import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router-dom';

import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';
import type { Product } from '../../model/types';

import styles from './CartItemCard.module.css';

type Props = {
    product: Product;
    quantity: number;
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

export const CartItemCard = observer(({ product, quantity }: Props) => {
    const location = useLocation();
    const mainImage = product.images[0];
    const isFavorite = shopFavoritesStore.has(product.id);

    const productLinkState: ProductPageNavigationState = {
        from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            scrollY: window.scrollY,
            productId: product.id,
        },
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

    const handleRemove = (): void => {
        shopCartStore.remove(product.id);
    };

    const handleToggleFavorite = (): void => {
        shopFavoritesStore.toggle(product.id);
    };

    return (
        <article className={styles.card}>
            <Link
                to={`/shop/${product.slug}`}
                state={productLinkState}
                className={styles.imageLink}
            >
                {mainImage ? (
                    <img
                        className={styles.image}
                        src={mainImage.url}
                        alt={mainImage.alt}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.imagePlaceholder}>Нет изображения</div>
                )}
            </Link>

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

                    <div className={styles.topActions}>
                        <button
                            className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ''}`}
                            type="button"
                            onClick={handleToggleFavorite}
                        >
                            {isFavorite ? 'В избранном' : 'В избранное'}
                        </button>

                        <button className={styles.removeButton} type="button" onClick={handleRemove}>
                            Удалить
                        </button>
                    </div>
                </div>

                <div className={styles.bottomRow}>
                    <div className={styles.priceBlock}>
                        <span className={styles.price}>{formatPrice(product.price)}</span>
                        <span className={styles.lineTotal}>
                            Итого: {formatPrice(product.price * quantity)}
                        </span>
                    </div>

                    <div className={styles.controls}>
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
                            disabled={!product.isAvailable || quantity >= product.stockQuantity}
                        >
                            +
                        </button>
                    </div>
                </div>
                {!product.isAvailable ? (
                    <div className={styles.unavailable}>Товар сейчас недоступен для заказа</div>
                ) : null}
            </div>
        </article>
    );
});

function formatPrice(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value);
}