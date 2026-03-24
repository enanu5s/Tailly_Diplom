// src/pages/shop/ui/ShopPaymentPage.tsx

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type { Order, PaymentMethod } from '@/features/shop/model/types';
import { shopOrderService } from '@/features/shop/service/shopOrderService';

import styles from './ShopPaymentPage.module.css';


type PayTab = 'card' | 'sbp';

export function ShopPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [tab, setTab] = useState<PayTab>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [payError, setPayError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoadError('Не указан номер заказа.');
      setIsLoading(false);

      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const loaded = await shopOrderService.getOrderById(orderId);

        if (cancelled) {
          return;
        }

        if (!loaded) {
          setLoadError('Заказ не найден.');
          setOrder(null);

          return;
        }

        if (loaded.paymentMethod === 'cash') {
          navigate(`/shop/order/${encodeURIComponent(orderId)}`, {
            replace: true,
          });

          return;
        }

        if (loaded.status === 'paid') {
          navigate(`/shop/order/${encodeURIComponent(orderId)}`, {
            replace: true,
          });

          return;
        }

        setOrder(loaded);
        setTab(
          loaded.paymentMethod === 'sbp'
            ? 'sbp'
            : loaded.paymentMethod === 'card'
              ? 'card'
              : 'card',
        );
      } catch {
        if (!cancelled) {
          setLoadError('Не удалось загрузить заказ.');
          setOrder(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, orderId]);

  const digitsOnly = (value: string): string => value.replace(/\D/g, '');

  const cardValid =
    digitsOnly(cardNumber).length >= 16 &&
    cardExpiry.trim().length >= 4 &&
    digitsOnly(cardCvc).length >= 3;

  const canSubmit =
    tab === 'sbp' ? true : cardValid;

  const handlePay = useCallback(async (): Promise<void> => {
    if (!orderId || !order) {
      return;
    }

    const method: PaymentMethod = tab === 'sbp' ? 'sbp' : 'card';

    setPayError(null);
    setIsPaying(true);

    try {
      await shopOrderService.payShopOrder(orderId, { paymentMethod: method });
      navigate(`/shop/order/${encodeURIComponent(orderId)}`);
    } catch (error) {
      setPayError(
        error instanceof Error ? error.message : 'Не удалось провести оплату.',
      );
    } finally {
      setIsPaying(false);
    }
  }, [navigate, order, orderId, tab]);

  const formatCardInput = (raw: string): string => {
    const d = digitsOnly(raw).slice(0, 16);
    const parts: string[] = [];

    for (let i = 0; i < d.length; i += 4) {
      parts.push(d.slice(i, i + 4));
    }

    return parts.join(' ');
  };

  const formatExpiryInput = (raw: string): string => {
    const d = digitsOnly(raw).slice(0, 4);

    if (d.length <= 2) {
      return d;
    }

    return `${d.slice(0, 2)}/${d.slice(2)}`;
  };

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
          {orderId ? (
            <Link
              to={`/shop/order/${encodeURIComponent(orderId)}`}
              className={styles.breadcrumbLink}
            >
              Заказ
            </Link>
          ) : (
            <span className={styles.breadcrumbLink}>Заказ</span>
          )}
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Оплата</span>
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>Оплата заказа</h1>
          <p className={styles.subtitle}>
            Выберите способ оплаты и подтвердите платёж. Данные используются
            только для демонстрации интерфейса.
          </p>
        </header>

        {payError ? <div className={styles.errorBanner}>{payError}</div> : null}

        {isLoading ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Загружаем заказ</h2>
            <p className={styles.stateText}>Подготавливаем данные для оплаты.</p>
          </div>
        ) : null}

        {!isLoading && loadError ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Оплата недоступна</h2>
            <p className={styles.stateText}>{loadError}</p>
            <Link to="/shop" className={styles.primaryLink}>
              В каталог
            </Link>
          </div>
        ) : null}

        {!isLoading && !loadError && order ? (
          <div className={styles.layout}>
            <section className={styles.mainCard}>
              <p className={styles.orderMeta}>
                Заказ <strong>{order.id}</strong>
              </p>

              <div className={styles.methodTabs}>
                <button
                  type="button"
                  className={`${styles.methodTab} ${
                    tab === 'card' ? styles.methodTabActive : ''
                  }`}
                  onClick={() => setTab('card')}
                >
                  Банковская карта
                </button>
                <button
                  type="button"
                  className={`${styles.methodTab} ${
                    tab === 'sbp' ? styles.methodTabActive : ''
                  }`}
                  onClick={() => setTab('sbp')}
                >
                  СБП
                </button>
              </div>

              {tab === 'card' ? (
                <div className={styles.panel}>
                  <p className={styles.panelHint}>
                    Введите реквизиты карты. В демо-режиме оплата проходит без
                    списания средств.
                  </p>

                  <label className={styles.field}>
                    <span className={styles.label}>Номер карты</span>
                    <input
                      className={styles.input}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(event) =>
                        setCardNumber(formatCardInput(event.target.value))
                      }
                    />
                  </label>

                  <div className={styles.inputRow}>
                    <label className={styles.field}>
                      <span className={styles.label}>Срок (ММ/ГГ)</span>
                      <input
                        className={styles.input}
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="ММ/ГГ"
                        value={cardExpiry}
                        onChange={(event) =>
                          setCardExpiry(formatExpiryInput(event.target.value))
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>CVC</span>
                      <input
                        className={styles.input}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="000"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(event) =>
                          setCardCvc(digitsOnly(event.target.value).slice(0, 4))
                        }
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className={styles.payButton}
                    disabled={!canSubmit || isPaying}
                    onClick={() => {
                      void handlePay();
                    }}
                  >
                    {isPaying ? 'Обработка…' : `Оплатить ${formatPrice(order.totalPrice)}`}
                  </button>
                </div>
              ) : (
                <div className={styles.panel}>
                  <p className={styles.panelHint}>
                    Отсканируйте QR-код в приложении банка или подтвердите
                    перевод по СБП. Ниже — имитация экрана оплаты.
                  </p>

                  <div className={styles.sbpQr}>
                    <div className={styles.sbpQrBox} aria-hidden />
                    <p className={styles.sbpQrCaption}>
                      После подтверждения в банке нажмите «Подтвердить оплату».
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.payButton}
                    disabled={isPaying}
                    onClick={() => {
                      void handlePay();
                    }}
                  >
                    {isPaying
                      ? 'Проверяем оплату…'
                      : `Подтвердить оплату ${formatPrice(order.totalPrice)}`}
                  </button>
                </div>
              )}

              <Link
                to={`/shop/order/${encodeURIComponent(order.id)}`}
                className={styles.secondaryLink}
              >
                Вернуться к заказу без оплаты
              </Link>
            </section>

            <aside className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Состав</h2>
              <div className={styles.summaryList}>
                {order.items.map((item) => (
                  <div key={item.product.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemMeta}>
                      <span className={styles.summaryItemTitle}>
                        {item.product.title}
                      </span>
                      <span className={styles.summaryItemQty}>
                        {item.quantity} шт.
                      </span>
                    </div>
                    <span className={styles.summaryItemPrice}>
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.totalRow}>
                <span>К оплате</span>
                <strong>{formatPrice(order.totalPrice)}</strong>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}
