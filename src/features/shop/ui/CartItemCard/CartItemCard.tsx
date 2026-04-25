// src/features/shop/ui/CartItemCard/CartItemCard.tsx
import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router-dom';

import styles from './CartItemCard.module.css';
import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';
import favoriteOutlineIconUrl from '@/shared/ui/icons/favorite-outline.svg';
import favoriteFilledIconUrl from '@/shared/ui/icons/favorite-filled.svg';
import deleteIconUrl from '@/shared/assets/icons/delete.svg';

import type { Product } from '../../model/types';

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

  const deliveryText = product.deliveryRange
    ? formatDeliveryRange(product.deliveryRange.from, product.deliveryRange.to)
    : product.shortDescription;

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

            <p className={styles.description}>{deliveryText}</p>
          </div>

          <div className={styles.topActions}>
            <button
              className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ''}`}
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <img
                className={styles.favoriteIcon}
                src={isFavorite ? favoriteFilledIconUrl : favoriteOutlineIconUrl}
                alt=""
                aria-hidden="true"
              />
            </button>

            <button
              className={styles.removeButton}
              type="button"
              onClick={handleRemove}
              aria-label="Удалить из корзины"
            >
              <img className={styles.removeIcon} src={deleteIconUrl} alt="" aria-hidden="true" />
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

function formatDeliveryRange(from: string, to: string): string {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 'Срок доставки уточняется';
  }

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  return `с ${formatter.format(fromDate)} - по ${formatter.format(toDate)}`;
}
