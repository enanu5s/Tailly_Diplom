// src/pages/shop/ui/ShopCheckoutPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { RepeatableProductOrder } from '@/features/orders/model/productOrderRepeat';
import { shopCheckoutStore } from '@/features/shop/model/shopCheckoutStore';
import { ProductBackButton } from '@/features/shop/ui';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './ShopCheckoutPage.module.css';

const CHECKOUT_ICONS = {
  deliveryCourier: '/images/shop-checkout/carbon_delivery.svg',
  deliveryPickup: '/images/shop-checkout/teenyicons_shop-outline.svg',
  payCard: '/images/shop-checkout/mdi_account-credit-card-outline.svg',
  paySbp: '/images/shop-checkout/f7_qrcode.svg',
  payCardCourier: '/images/shop-checkout/ion_card-outline.svg',
  payCash: '/images/shop-checkout/ph_money-light.svg',
} as const;

type ShopCheckoutPageLocationState = {
  from?: {
    pathname: string;
    search: string;
    hash: string;
    scrollY: number;
    productId: string;
  };
  source?: 'repeat_product_order';
  orderId?: string;
  repeatOrder?: RepeatableProductOrder;
};

export const ShopCheckoutPage = observer(() => {
  const location = useLocation();
  const navigate = useAppNavigate();
  const state = (location.state ?? null) as ShopCheckoutPageLocationState | null;
  const from = state?.from;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (state?.repeatOrder) {
      shopCheckoutStore.loadFromRepeatOrder(state.repeatOrder);

      return () => {
        shopCheckoutStore.reset();
      };
    }

    void shopCheckoutStore.load();

    return () => {
      shopCheckoutStore.reset();
    };
  }, [state?.repeatOrder]);

  const handleSubmit = async (): Promise<void> => {
    const order = await shopCheckoutStore.submit();

    if (!order) {
      return;
    }

    if (order.paymentMethod === 'card' || order.paymentMethod === 'sbp') {
      navigate(`/shop/order/${order.id}/payment`);
      return;
    }

    navigate(`/shop/order/${order.id}`);
  };

  const {
    form,
    detailedItems,
    totalItems,
    totalPrice,
    isEmpty,
    isLoading,
    isInitialized,
    isSubmitting,
    error,
    pickupPoints,
    isPickupPointsLoading,
    pickupPointsError,
    validationErrors,
  } = shopCheckoutStore;

  return (
    <div className={styles.page}>
      <div className={styles.blur} />

      <div className={styles.container}>
        <div className={styles.topBar}>
          <ProductBackButton from={from} fallbackPath="/shop/cart" />
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>Оформление заказа</h1>
        </header>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        {validationErrors.cart ? (
          <div className={styles.errorBanner}>{validationErrors.cart}</div>
        ) : null}

        {!error && isLoading && !isInitialized ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Загружаем оформление</h2>
            <p className={styles.stateText}>Подготавливаем состав заказа и форму.</p>
          </div>
        ) : null}

        {!error && isInitialized && isEmpty ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Корзина пуста</h2>
            <p className={styles.stateText}>
              Добавь товары в корзину перед оформлением заказа.
            </p>

            <Link to="/shop" className={styles.primaryLink}>
              Перейти в каталог
            </Link>
          </div>
        ) : null}

        {!error && detailedItems.length > 0 ? (
          <div className={styles.layout}>
            <section className={styles.formSection}>
              <div className={styles.block}>
                <h2 className={styles.blockTitle}>Личные данные</h2>

                <div className={styles.personalGrid}>
                  <label className={styles.field}>
                    <span className={styles.label}>Имя</span>
                    <input
                      className={styles.input}
                      value={form.recipient.firstName}
                      onChange={(event) =>
                        shopCheckoutStore.setRecipientField(
                          'firstName',
                          event.target.value,
                        )
                      }
                      placeholder="Елена"
                    />
                    {validationErrors.firstName ? (
                      <span className={styles.fieldError}>
                        {validationErrors.firstName}
                      </span>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Фамилия</span>
                    <input
                      className={styles.input}
                      value={form.recipient.lastName}
                      onChange={(event) =>
                        shopCheckoutStore.setRecipientField(
                          'lastName',
                          event.target.value,
                        )
                      }
                      placeholder="Смирнова"
                    />
                    {validationErrors.lastName ? (
                      <span className={styles.fieldError}>
                        {validationErrors.lastName}
                      </span>
                    ) : null}
                  </label>

                  <label className={`${styles.field} ${styles.patronymicField}`}>
                    <span className={styles.label}>Отчество (не обязательно)</span>
                    <input className={styles.input} placeholder="" />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Телефон</span>
                    <input
                      className={styles.input}
                      value={form.recipient.phone}
                      onChange={(event) =>
                        shopCheckoutStore.setRecipientField('phone', event.target.value)
                      }
                      placeholder="+7 (900) 000-00-20"
                    />
                    {validationErrors.phone ? (
                      <span className={styles.fieldError}>{validationErrors.phone}</span>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Email</span>
                    <input
                      className={styles.input}
                      value={form.recipient.email}
                      onChange={(event) =>
                        shopCheckoutStore.setRecipientField('email', event.target.value)
                      }
                      placeholder="specialist@tailly.com"
                    />
                    {validationErrors.email ? (
                      <span className={styles.fieldError}>{validationErrors.email}</span>
                    ) : null}
                  </label>
                </div>
              </div>

              <div className={styles.block}>
                <h2 className={styles.blockTitle}>Способ доставки</h2>

                <div className={styles.options}>
                  <label
                    className={`${styles.optionCard} ${
                      form.deliveryMethod === 'courier' ? styles.deliveryActive : ''
                    }`}
                  >
                    <input
                      className={styles.hiddenRadio}
                      type="radio"
                      checked={form.deliveryMethod === 'courier'}
                      onChange={() => {
                        void shopCheckoutStore.setDeliveryMethod('courier');
                      }}
                    />
                    <span className={styles.optionIcon} aria-hidden>
                      <img
                        className={styles.optionIconImg}
                        src={CHECKOUT_ICONS.deliveryCourier}
                        alt=""
                      />
                    </span>
                    <span>Курьером</span>
                  </label>

                  <label
                    className={`${styles.optionCard} ${
                      form.deliveryMethod === 'pickup-point' ? styles.deliveryActive : ''
                    }`}
                  >
                    <input
                      className={styles.hiddenRadio}
                      type="radio"
                      checked={form.deliveryMethod === 'pickup-point'}
                      onChange={() => {
                        void shopCheckoutStore.setDeliveryMethod('pickup-point');
                      }}
                    />
                    <span className={styles.optionIcon} aria-hidden>
                      <img
                        className={styles.optionIconImg}
                        src={CHECKOUT_ICONS.deliveryPickup}
                        alt=""
                      />
                    </span>
                    <span>Забрать из ПВЗ СДЕК</span>
                  </label>
                </div>

                {form.deliveryMethod === 'courier' ? (
                  <div className={styles.deliveryGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>Город</span>
                      <input
                        className={styles.input}
                        value={form.address.city}
                        onChange={(event) =>
                          shopCheckoutStore.setAddressField('city', event.target.value)
                        }
                        placeholder="Москва"
                      />
                      {validationErrors.city ? (
                        <span className={styles.fieldError}>{validationErrors.city}</span>
                      ) : null}
                    </label>

                    <label className={`${styles.field} ${styles.streetField}`}>
                      <span className={styles.label}>Улица</span>
                      <input
                        className={styles.input}
                        value={form.address.street}
                        onChange={(event) =>
                          shopCheckoutStore.setAddressField('street', event.target.value)
                        }
                        placeholder="Тверская улица"
                      />
                      {validationErrors.street ? (
                        <span className={styles.fieldError}>
                          {validationErrors.street}
                        </span>
                      ) : null}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Дом</span>
                      <input
                        className={styles.input}
                        value={form.address.house}
                        onChange={(event) =>
                          shopCheckoutStore.setAddressField('house', event.target.value)
                        }
                        placeholder="124"
                      />
                      {validationErrors.house ? (
                        <span className={styles.fieldError}>
                          {validationErrors.house}
                        </span>
                      ) : null}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Корпус</span>
                      <input className={styles.input} placeholder="1" />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Подъезд</span>
                      <input className={styles.input} placeholder="3" />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Этаж</span>
                      <input className={styles.input} placeholder="12" />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Квартира</span>
                      <input
                        className={styles.input}
                        value={form.address.apartment}
                        onChange={(event) =>
                          shopCheckoutStore.setAddressField(
                            'apartment',
                            event.target.value,
                          )
                        }
                        placeholder="234"
                      />
                    </label>

                    <label className={`${styles.field} ${styles.commentField}`}>
                      <span className={styles.label}>Комментарий для курьера</span>
                      <textarea
                        className={styles.textarea}
                        value={form.address.comment}
                        onChange={(event) =>
                          shopCheckoutStore.setAddressField('comment', event.target.value)
                        }
                        placeholder="Например: Нет доступа к шлагбауму"
                      />
                    </label>
                  </div>
                ) : (
                  <div className={styles.pickupBlock}>
                    <label className={styles.field}>
                      <span className={styles.label}>Город</span>
                      <input
                        className={styles.input}
                        value={form.address.city}
                        onChange={(event) =>
                          shopCheckoutStore.setAddressField('city', event.target.value)
                        }
                        placeholder="Москва"
                      />
                      {validationErrors.city ? (
                        <span className={styles.fieldError}>{validationErrors.city}</span>
                      ) : null}
                    </label>

                    <label className={`${styles.field} ${styles.pickupPointField}`}>
                      <span className={styles.label}>ПВЗ СДЕК</span>

                      <select
                        className={styles.select}
                        value={form.pickupPointId ?? ''}
                        onChange={(event) =>
                          shopCheckoutStore.setPickupPointId(event.target.value)
                        }
                        disabled={isPickupPointsLoading}
                      >
                        {pickupPoints.map((point) => (
                          <option key={point.id} value={point.id}>
                            {point.title} — {point.address}
                          </option>
                        ))}
                      </select>

                      {validationErrors.pickupPointId ? (
                        <span className={styles.fieldError}>
                          {validationErrors.pickupPointId}
                        </span>
                      ) : null}

                      {pickupPointsError ? (
                        <span className={styles.fieldError}>{pickupPointsError}</span>
                      ) : null}
                    </label>
                  </div>
                )}
              </div>

              <div className={styles.block}>
                <h2 className={styles.blockTitle}>Способ оплаты</h2>

                <div className={styles.paymentOptions}>
                  <label
                    className={`${styles.optionCard} ${
                      form.paymentMethod === 'card' ? styles.paymentActive : ''
                    }`}
                  >
                    <input
                      className={styles.hiddenRadio}
                      type="radio"
                      checked={form.paymentMethod === 'card'}
                      onChange={() => shopCheckoutStore.setPaymentMethod('card')}
                    />
                    <span className={styles.optionIcon} aria-hidden>
                      <img
                        className={styles.optionIconImg}
                        src={CHECKOUT_ICONS.payCard}
                        alt=""
                      />
                    </span>
                    <span>Карта</span>
                  </label>

                  <label
                    className={`${styles.optionCard} ${
                      form.paymentMethod === 'sbp' ? styles.paymentActive : ''
                    }`}
                  >
                    <input
                      className={styles.hiddenRadio}
                      type="radio"
                      checked={form.paymentMethod === 'sbp'}
                      onChange={() => shopCheckoutStore.setPaymentMethod('sbp')}
                    />
                    <span className={styles.optionIcon} aria-hidden>
                      <img
                        className={styles.optionIconImg}
                        src={CHECKOUT_ICONS.paySbp}
                        alt=""
                      />
                    </span>
                    <span>СБП</span>
                  </label>

                  <label
                    className={`${styles.optionCard} ${
                      form.paymentMethod === 'card_courier' ? styles.paymentActive : ''
                    } ${
                      form.deliveryMethod === 'pickup-point'
                        ? styles.optionCardDisabled
                        : ''
                    }`}
                  >
                    <input
                      className={styles.hiddenRadio}
                      type="radio"
                      checked={form.paymentMethod === 'card_courier'}
                      onChange={() => shopCheckoutStore.setPaymentMethod('card_courier')}
                      disabled={form.deliveryMethod === 'pickup-point'}
                    />
                    <span className={styles.optionIcon} aria-hidden>
                      <img
                        className={styles.optionIconImg}
                        src={CHECKOUT_ICONS.payCardCourier}
                        alt=""
                      />
                    </span>
                    <span>Картой курьеру</span>
                  </label>

                  <label
                    className={`${styles.optionCard} ${
                      form.paymentMethod === 'cash' ? styles.paymentActive : ''
                    } ${
                      form.deliveryMethod === 'pickup-point'
                        ? styles.optionCardDisabled
                        : ''
                    }`}
                  >
                    <input
                      className={styles.hiddenRadio}
                      type="radio"
                      checked={form.paymentMethod === 'cash'}
                      onChange={() => shopCheckoutStore.setPaymentMethod('cash')}
                      disabled={form.deliveryMethod === 'pickup-point'}
                    />
                    <span className={styles.optionIcon} aria-hidden>
                      <img
                        className={styles.optionIconImg}
                        src={CHECKOUT_ICONS.payCash}
                        alt=""
                      />
                    </span>
                    <span>Наличными курьеру</span>
                  </label>
                </div>
              </div>
            </section>

            <aside className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Ваш заказ</h2>

                <div className={styles.summaryList}>
                  {detailedItems.map((item) => (
                    <div key={item.product.id} className={styles.summaryItem}>
                      <div className={styles.summaryItemMeta}>
                        <span className={styles.summaryItemTitle}>
                          {item.product.title}
                        </span>
                        <span className={styles.summaryItemQty}>{item.quantity} шт.</span>
                      </div>

                      <span className={styles.summaryItemPrice}>
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryTotals}>
                  <div className={styles.summaryRow}>
                    <span>Количество товаров</span>
                    <strong>{totalItems} шт.</strong>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Итоговая сумма</span>
                    <strong className={styles.totalPrice}>
                      {formatPrice(totalPrice)}
                    </strong>
                  </div>
                </div>

                <button
                  className={styles.submitButton}
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Оформляем заказ...'
                    : form.paymentMethod === 'card' || form.paymentMethod === 'sbp'
                      ? 'Перейти к оформлению'
                      : 'Подтвердить заказ'}
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
});

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}
