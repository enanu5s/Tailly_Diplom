// src/features/shop/ui/ProductPurchasePanel/ProductPurchasePanel.tsx
import { observer } from 'mobx-react-lite';

import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';
import type { Product } from '../../model/types';

import styles from './ProductPurchasePanel.module.css';

type Props = {
    product: Product;
};

export const ProductPurchasePanel = observer(({ product }: Props) => {
    const isFavorite = shopFavoritesStore.has(product.id);
    const quantity = shopCartStore.getQuantity(product.id);

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
        if (!product.isAvailable || quantity >= product.stockQuantity) {
            return;
        }

        shopCartStore.increment(product.id);
    };

    const handleDecrement = (): void => {
        shopCartStore.decrement(product.id);
    };

    return (
        <aside className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.category}>{product.categoryTitle}</div>
                <div className={styles.rating}>
                    ★ {product.rating.toFixed(1)} · {product.reviewsCount} отзывов
                </div>
            </div>

            <h1 className={styles.title}>{product.title}</h1>

            <p className={styles.shortDescription}>{product.shortDescription}</p>

            <div className={styles.priceBlock}>
                <div className={styles.prices}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                    {product.oldPrice !== null ? (
                        <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
                    ) : null}
                </div>

                {product.oldPrice !== null && product.oldPrice > product.price ? (
                    <div className={styles.discount}>
                        Скидка {formatPrice(product.oldPrice - product.price)}
                    </div>
                ) : null}
            </div>

            <div className={styles.statusRow}>
                {product.isAvailable ? (
                    <span className={styles.available}>В наличии: {product.stockQuantity} шт.</span>
                ) : (
                    <span className={styles.unavailable}>Нет в наличии</span>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ''}`}
                    type="button"
                    onClick={handleToggleFavorite}
                >
                    {isFavorite ? 'В избранном' : 'В избранное'}
                </button>

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

            {quantity > 0 ? (
                <div className={styles.cartHint}>
                    Товар уже добавлен в корзину. Количество можно изменить здесь.
                </div>
            ) : null}
        </aside>
    );
});

function formatPrice(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value);
}