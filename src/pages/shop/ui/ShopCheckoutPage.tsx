// src/pages/shop/ui/ShopCheckoutPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ProductBackButton } from '@/features/shop/ui';
import { shopCheckoutStore } from '@/features/shop/model/shopCheckoutStore';

import styles from './ShopCheckoutPage.module.css';

type ShopCheckoutPageLocationState = {
    from?: {
        pathname: string;
        search: string;
        hash: string;
        scrollY: number;
        productId: string;
    };
};

export const ShopCheckoutPage = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state ?? null) as ShopCheckoutPageLocationState | null;
    const from = state?.from;

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'auto',
        });
    }, []);

    useEffect(() => {
        void shopCheckoutStore.load();

        return () => {
            shopCheckoutStore.reset();
        };
    }, []);

    const handleSubmit = async (): Promise<void> => {
        const order = await shopCheckoutStore.submit();

        if (!order) {
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
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <ProductBackButton from={from} fallbackPath="/shop/cart" />
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
                    <Link to="/shop/cart" className={styles.breadcrumbLink}>
                        Корзина
                    </Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.breadcrumbCurrent}>Оформление заказа</span>
                </div>

                <header className={styles.header}>
                    <h1 className={styles.title}>Оформление заказа</h1>
                    <p className={styles.subtitle}>
                        Заполни данные для доставки и выбери способ оплаты.
                    </p>
                </header>

                {error ? (
                    <div className={styles.errorBanner}>{error}</div>
                ) : null}

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
                                <div className={styles.grid}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Имя</span>
                                        <input
                                            className={styles.input}
                                            value={form.recipient.firstName}
                                            onChange={(event) =>
                                                shopCheckoutStore.setRecipientField('firstName', event.target.value)
                                            }
                                            placeholder="Иван"
                                        />
                                        {validationErrors.firstName ? (
                                            <span className={styles.fieldError}>{validationErrors.firstName}</span>
                                        ) : null}
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.label}>Фамилия</span>
                                        <input
                                            className={styles.input}
                                            value={form.recipient.lastName}
                                            onChange={(event) =>
                                                shopCheckoutStore.setRecipientField('lastName', event.target.value)
                                            }
                                            placeholder="Иванов"
                                        />
                                        {validationErrors.lastName ? (
                                            <span className={styles.fieldError}>{validationErrors.lastName}</span>
                                        ) : null}
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.label}>Телефон</span>
                                        <input
                                            className={styles.input}
                                            value={form.recipient.phone}
                                            onChange={(event) =>
                                                shopCheckoutStore.setRecipientField('phone', event.target.value)
                                            }
                                            placeholder="+7 (900) 000-00-00"
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
                                            placeholder="mail@example.com"
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
                                    <label className={styles.optionCard}>
                                        <input
                                            type="radio"
                                            checked={form.deliveryMethod === 'courier'}
                                            onChange={() => {
                                                void shopCheckoutStore.setDeliveryMethod('courier');
                                            }}
                                        />
                                        <span>Курьером</span>
                                    </label>

                                    <label className={styles.optionCard}>
                                        <input
                                            type="radio"
                                            checked={form.deliveryMethod === 'pickup-point'}
                                            onChange={() => {
                                                void shopCheckoutStore.setDeliveryMethod('pickup-point');
                                            }}
                                        />
                                        <span>Забрать из ПВЗ СДЭК</span>
                                    </label>
                                </div>
                                <div className={styles.grid}>
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

                                    {form.deliveryMethod === 'courier' ? (
                                        <>
                                            <label className={styles.field}>
                                                <span className={styles.label}>Улица</span>
                                                <input
                                                    className={styles.input}
                                                    value={form.address.street}
                                                    onChange={(event) =>
                                                        shopCheckoutStore.setAddressField('street', event.target.value)
                                                    }
                                                    placeholder="Тверская"
                                                />
                                                {validationErrors.street ? (
                                                    <span className={styles.fieldError}>{validationErrors.street}</span>
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
                                                    placeholder="12"
                                                />
                                                {validationErrors.house ? (
                                                    <span className={styles.fieldError}>{validationErrors.house}</span>
                                                ) : null}
                                            </label>

                                            <label className={styles.field}>
                                                <span className={styles.label}>Квартира</span>
                                                <input
                                                    className={styles.input}
                                                    value={form.address.apartment}
                                                    onChange={(event) =>
                                                        shopCheckoutStore.setAddressField('apartment', event.target.value)
                                                    }
                                                    placeholder="45"
                                                />
                                            </label>

                                            <label className={`${styles.field} ${styles.fieldFull}`}>
                                                <span className={styles.label}>Комментарий для курьера</span>
                                                <textarea
                                                    className={styles.textarea}
                                                    value={form.address.comment}
                                                    onChange={(event) =>
                                                        shopCheckoutStore.setAddressField('comment', event.target.value)
                                                    }
                                                    placeholder="Домофон, подъезд, этаж"
                                                />
                                            </label>
                                        </>
                                    ) : (
                                        <label className={`${styles.field} ${styles.fieldFull}`}>
                                            <span className={styles.label}>ПВЗ СДЭК</span>
                                            <div className={styles.inlineActions}>
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

                                                <button
                                                    className={styles.secondaryButton}
                                                    type="button"
                                                    onClick={() => {
                                                        void shopCheckoutStore.loadPickupPoints();
                                                    }}
                                                    disabled={isPickupPointsLoading}
                                                >
                                                    Обновить ПВЗ
                                                </button>
                                            </div>

                                            {validationErrors.pickupPointId ? (
                                                <span className={styles.fieldError}>{validationErrors.pickupPointId}</span>
                                            ) : null}

                                            {pickupPointsError ? (
                                                <span className={styles.fieldError}>{pickupPointsError}</span>
                                            ) : null}
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className={styles.block}>
                                <h2 className={styles.blockTitle}>Способ оплаты</h2>

                                <div className={styles.options}>
                                    <label className={styles.optionCard}>
                                        <input
                                            type="radio"
                                            checked={form.paymentMethod === 'card'}
                                            onChange={() => shopCheckoutStore.setPaymentMethod('card')}
                                        />
                                        <span>Карта</span>
                                    </label>

                                    <label className={styles.optionCard}>
                                        <input
                                            type="radio"
                                            checked={form.paymentMethod === 'sbp'}
                                            onChange={() => shopCheckoutStore.setPaymentMethod('sbp')}
                                        />
                                        <span>СБП</span>
                                    </label>

                                    <label className={`${styles.optionCard} ${form.deliveryMethod === 'pickup-point' ? styles.optionCardDisabled : ''}`}>
                                        <input
                                            type="radio"
                                            checked={form.paymentMethod === 'cash'}
                                            onChange={() => shopCheckoutStore.setPaymentMethod('cash')}
                                            disabled={form.deliveryMethod === 'pickup-point'}
                                        />
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
                                                <span className={styles.summaryItemTitle}>{item.product.title}</span>
                                                <span className={styles.summaryItemQty}>{item.quantity} шт.</span>
                                            </div>
                                            <span className={styles.summaryItemPrice}>
                                                {formatPrice(item.lineTotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.summaryTotals}>
                                    <div className={styles.summaryRow}>
                                        <span>Товаров</span>
                                        <span>{totalItems}</span>
                                    </div>

                                    <div className={styles.summaryRow}>
                                        <span>Итого</span>
                                        <strong>{formatPrice(totalPrice)}</strong>
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
                                    {isSubmitting ? 'Оформляем заказ...' : 'Подтвердить заказ'}
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