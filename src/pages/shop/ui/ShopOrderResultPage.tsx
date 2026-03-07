// src/pages/shop/ui/ShopOrderResultPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { shopOrderStore } from '@/features/shop/model/shopOrderStore';

import styles from './ShopOrderResultPage.module.css';

export const ShopOrderResultPage = observer(() => {
    const { orderId } = useParams<{ orderId: string }>();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'auto',
        });
    }, []);

    useEffect(() => {
        if (!orderId) {
            return;
        }

        void shopOrderStore.loadById(orderId);

        return () => {
            shopOrderStore.reset();
        };
    }, [orderId]);

    const { order, isLoading, error } = shopOrderStore;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.breadcrumbs}>
                    <Link to="/" className={styles.breadcrumbLink}>
                        Главная
                    </Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <Link to="/shop" className={styles.breadcrumbLink}>
                        Магазин
                    </Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.breadcrumbCurrent}>Статус заказа</span>
                </div>

                {isLoading ? (
                    <div className={styles.stateCard}>
                        <h1 className={styles.title}>Загружаем заказ</h1>
                        <p className={styles.subtitle}>Подготавливаем информацию о заказе.</p>
                    </div>
                ) : null}

                {!isLoading && error ? (
                    <div className={styles.stateCard}>
                        <h1 className={styles.title}>Не удалось открыть заказ</h1>
                        <p className={styles.subtitle}>{error}</p>

                        <div className={styles.actions}>
                            <Link to="/shop" className={styles.primaryLink}>
                                Вернуться в магазин
                            </Link>
                        </div>
                    </div>
                ) : null}

                {!isLoading && !error && order ? (
                    <div className={styles.layout}>
                        <section className={styles.mainCard}>
                            <div className={styles.badge}>
                                {order.status === 'paid' ? 'Заказ успешно оформлен' : 'Заказ создан'}
                            </div>

                            <h1 className={styles.title}>Спасибо за заказ</h1>
                            <p className={styles.subtitle}>
                                Мы сохранили заказ #{order.id}. Подтверждение в mock-режиме считается отправленным на email.
                            </p>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Статус</span>
                                    <span className={styles.infoValue}>{getStatusLabel(order.status)}</span>
                                </div>

                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Доставка</span>
                                    <span className={styles.infoValue}>{getDeliveryLabel(order.deliveryMethod)}</span>
                                </div>

                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Оплата</span>
                                    <span className={styles.infoValue}>{getPaymentLabel(order.paymentMethod)}</span>
                                </div>

                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Примерная дата</span>
                                    <span className={styles.infoValue}>
                                        {order.estimatedDeliveryDate ? formatDate(order.estimatedDeliveryDate) : 'Уточняется'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <Link to="/shop" className={styles.primaryLink}>
                                    Продолжить покупки
                                </Link>
                            </div>
                        </section>

                        <aside className={styles.summaryCard}>
                            <h2 className={styles.summaryTitle}>Состав заказа</h2>
                            <div className={styles.summaryList}>
                                {order.items.map((item) => (
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

                            <div className={styles.totalRow}>
                                <span>Итого</span>
                                <strong>{formatPrice(order.totalPrice)}</strong>
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

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
}

function getStatusLabel(value: string): string {
    switch (value) {
        case 'paid':
            return 'Оплачен';
        case 'created':
            return 'Создан';
        case 'processing':
            return 'В обработке';
        case 'delivering':
            return 'У курьера';
        case 'ready-for-pickup':
            return 'Едет на ПВЗ';
        case 'completed':
            return 'Завершён';
        case 'cancelled':
            return 'Отменён';
        default:
            return value;
    }
}

function getDeliveryLabel(value: string): string {
    return value === 'pickup-point' ? 'ПВЗ СДЭК' : 'Курьер';
}

function getPaymentLabel(value: string): string {
    switch (value) {
        case 'card':
            return 'Карта';
        case 'sbp':
            return 'СБП';
        case 'cash':
            return 'Наличными курьеру';
        default:
            return value;
    }
}