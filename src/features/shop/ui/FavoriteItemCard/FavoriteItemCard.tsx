// src/features/shop/ui/FavoriteItemCard/FavoriteItemCard.tsx
import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';

import styles from './FavoriteItemCard.module.css';
import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';
import minusIconUrl from '@/shared/assets/icons/minus.svg';
import plusIconUrl from '@/shared/assets/icons/plus.svg';
import favoriteFilledIconUrl from '@/shared/ui/icons/favorite-filled.svg';

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
    if (!product.isAvailable) return;
    shopCartStore.add(product.id, 1);
  };

  const handleIncrement = (): void => {
    if (!product.isAvailable || quantity >= product.stockQuantity) return;
    shopCartStore.increment(product.id);
  };

  const handleDecrement = (): void => {
    shopCartStore.decrement(product.id);
  };

  return (
    <article
      className={styles.card}
      data-shop-product-id={product.id}
      id={`shop-favorite-card-${product.id}`}
    >
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

      {showConsumerControls ? (
        <button
          className={styles.favoriteButton}
          type="button"
          onClick={handleRemoveFromFavorites}
          aria-label="Удалить из избранного"
        >
          <img
            className={styles.favoriteIcon}
            src={favoriteFilledIconUrl}
            alt=""
            aria-hidden="true"
          />
        </button>
      ) : null}

      <div className={styles.metaRow}>
        <span className={styles.category}>{product.categoryTitle}</span>

        {typeof product.rating === 'number' ? (
          <span className={styles.rating}>★ {product.rating.toFixed(1)}</span>
        ) : null}
      </div>

      <Link
        to={`/shop/${product.slug}`}
        state={productLinkState}
        className={styles.titleLink}
      >
        <h3 className={styles.title}>{product.title}</h3>
      </Link>

      <p className={styles.description}>{product.shortDescription}</p>

      <div className={styles.footer}>
        <span className={styles.price}>{formatPrice(product.price)}</span>

        {showConsumerControls ? (
          quantity > 0 ? (
            <div className={styles.quantityControl}>
              <button
                className={styles.quantityButton}
                type="button"
                onClick={handleDecrement}
                aria-label="Уменьшить количество"
              >
                <img
                  className={styles.quantityIcon}
                  src={minusIconUrl}
                  alt="-"
                  aria-hidden="true"
                />
              </button>

              <span className={styles.quantityValue}>{quantity}</span>

              <button
                className={styles.quantityButton}
                type="button"
                onClick={handleIncrement}
                aria-label="Увеличить количество"
                disabled={quantity >= product.stockQuantity}
              >
                <img
                  className={styles.quantityIcon}
                  src={plusIconUrl}
                  alt="+"
                  aria-hidden="true"
                />
              </button>
            </div>
          ) : (
            <button
              className={styles.cartButton}
              type="button"
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
            >
              {product.isAvailable ? 'В корзину' : 'Нет в наличии'}
            </button>
          )
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
