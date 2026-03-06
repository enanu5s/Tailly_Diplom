// src/features/shop/ui/ProductCard/ProductCard.tsx
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';
import type { Product } from '../../model/types';

import styles from './ProductCard.module.css';

type Props = {
    product: Product;
};

export const ProductCard = observer(({ product }: Props) => {
    const isFavorite = shopFavoritesStore.has(product.id);
    const quantity = shopCartStore.getQuantity(product.id);
    const mainImage = product.images[0];

    const handleToggleFavorite = (): void => {
        shopFavoritesStore.toggle(product.id);
    };

    const handleAddToCart = (): void => {
        if (!product.isAvailable) {
            return;
        }

        shopCartStore.add(product.id, 1);
    };

    const handleIncrement = (): void => {
        if (!product.isAvailable) {
            return;
        }

        if (quantity >= product.stockQuantity) {
            return;
        }

        shopCartStore.increment(product.id);
    };

    const handleDecrement = (): void => {
        shopCartStore.decrement(product.id);
    };

    return (
        <article className={styles.card}>
            <button
                className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ''}`}
                type="button"
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
                {isFavorite ? '♥️' : '♡'}
            </button>

            <Link to={`/shop/${product.slug}`} className={styles.imageLink}>
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
                <div className={styles.meta}>
                    <span className={styles.category}>{getCategoryLabel(product.category)}</span>
                    <span className={styles.rating}>★ {product.rating.toFixed(1)}</span>
                </div>

                <Link to={`/shop/${product.slug}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{product.title}</h3>
                </Link>

                <p className={styles.description}>{product.shortDescription}</p>

                <div className={styles.priceRow}>
                    <div className={styles.prices}>
                        <span className={styles.price}>{formatPrice(product.price)}</span>
                        {product.oldPrice !== null ? (
                            <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
                        ) : null}
                    </div>

                    {!product.isAvailable ? (
                        <span className={styles.unavailable}>Нет в наличии</span>
                    ) : (
                        <span className={styles.stock}>В наличии: {product.stockQuantity}</span>
                    )}
                </div>

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

function getCategoryLabel(category: Product['category']): string {
    switch (category) {
        case 'food':
            return 'Корм';
        case 'toys':
            return 'Игрушки';
        case 'care':
            return 'Уход';
        case 'accessories':
            return 'Аксессуары';
        case 'medicine':
            return 'Здоровье';
        case 'other':
        default:
            return 'Другое';
    }
}