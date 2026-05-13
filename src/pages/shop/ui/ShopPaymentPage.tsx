// src/pages/shop/ui/ShopPaymentPage.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { shopCartStore } from '@/features/shop/model/shopCartStore';
import type { Order } from '@/features/shop/model/types';
import { shopOrderService } from '@/features/shop/service/shopOrderService';

import styles from './ShopPaymentPage.module.css';

type PayTab = 'card' | 'sbp' | 'card_courier' | 'cash';

const PAYMENT_TABS: Array<{ id: PayTab; label: string; iconSrc: string }> = [
  { id: 'card', label: 'Карта', iconSrc: '/images/shop-checkout/ion_card-outline.svg' },
  { id: 'sbp', label: 'СБП', iconSrc: '/images/shop-checkout/f7_qrcode.svg' },
  {
    id: 'card_courier',
    label: 'Картой курьеру',
    iconSrc: '/images/shop-checkout/ion_card-outline.svg',
  },
  {
    id: 'cash',
    label: 'Наличными курьеру',
    iconSrc: '/images/shop-checkout/ph_money-light.svg',
  },
];

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
  const [saveCard, setSaveCard] = useState(true);
  const [payError, setPayError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
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

        if (loaded.status === 'paid') {
          navigate(`/shop/order/${encodeURIComponent(orderId)}`, { replace: true });
          return;
        }

        setOrder(loaded);

        if (
          loaded.paymentMethod === 'card' ||
          loaded.paymentMethod === 'sbp' ||
          loaded.paymentMethod === 'card_courier' ||
          loaded.paymentMethod === 'cash'
        ) {
          setTab(loaded.paymentMethod);
        }
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

  const totalQuantity = useMemo(() => {
    if (!order) {
      return 0;
    }

    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  const availableTabs = useMemo(() => {
    if (order?.deliveryMethod === 'pickup-point') {
      return PAYMENT_TABS.filter((item) => item.id === 'card' || item.id === 'sbp');
    }

    return PAYMENT_TABS;
  }, [order?.deliveryMethod]);

  useEffect(() => {
    if (!availableTabs.some((item) => item.id === tab)) {
      setTab('card');
    }
  }, [availableTabs, tab]);

  const digitsOnly = (value: string): string => value.replace(/\D/g, '');

  const cardValid =
    digitsOnly(cardNumber).length >= 16 &&
    cardExpiry.trim().length >= 5 &&
    digitsOnly(cardCvc).length >= 3;

  const canSubmit = tab === 'card' ? cardValid : true;

  const handlePay = useCallback(async (): Promise<void> => {
    if (!orderId || !order || !canSubmit) {
      return;
    }

    setPayError(null);
    setIsPaying(true);

    try {
      await shopOrderService.payShopOrder(orderId, { paymentMethod: tab });
      shopCartStore.clearLocal();
      navigate(`/shop/order/${encodeURIComponent(orderId)}`);
    } catch (error) {
      setPayError(error instanceof Error ? error.message : 'Не удалось провести оплату.');
    } finally {
      setIsPaying(false);
    }
  }, [canSubmit, navigate, order, orderId, tab]);

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

  const goBack = (): void => {
    navigate(-1);
  };

  return (
    <main className={styles.page}>
      <div className={styles.blur} />

      <div className={styles.container}>
        <button type="button" className={styles.backButton} onClick={goBack}>
          <span className={styles.backIcon}>←</span>
          Назад
        </button>

        <h1 className={styles.title}>Оплата заказа</h1>

        {payError ? <div className={styles.errorBanner}>{payError}</div> : null}

        {isLoading ? (
          <section className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Загружаем заказ</h2>
            <p className={styles.stateText}>Подготавливаем данные для оплаты.</p>
          </section>
        ) : null}

        {!isLoading && loadError ? (
          <section className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Оплата недоступна</h2>
            <p className={styles.stateText}>{loadError}</p>
            <button type="button" className={styles.payButton} onClick={() => navigate('/shop')}>
              В каталог
            </button>
          </section>
        ) : null}

        {!isLoading && !loadError && order ? (
          <div className={styles.layout}>
            <div className={styles.leftColumn}>
              <section className={styles.methodCard}>
                <h2 className={styles.sectionTitle}>Способ оплаты</h2>

                <div className={styles.methodTabs}>
                  {availableTabs.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.methodTab} ${
                        tab === item.id ? styles.methodTabActive : ''
                      }`}
                      onClick={() => setTab(item.id)}
                    >
                      <span className={styles.methodIcon} aria-hidden>
                        <img className={styles.methodIconImg} src={item.iconSrc} alt="" />
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              {tab === 'card' ? (
                <section className={styles.paymentCard}>
                  <div className={styles.cardForm}>
                    <h2 className={styles.sectionTitle}>Реквизиты карты</h2>

                    <label className={styles.field}>
                      <span className={styles.label}>Номер карты</span>
                      <input
                        className={styles.input}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(formatCardInput(event.target.value))}
                      />
                    </label>

                    <div className={styles.inputRow}>
                      <label className={styles.field}>
                        <span className={styles.label}>Срок</span>
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
                        <span className={styles.label}>CVC/CVV</span>
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

                    <label className={styles.checkboxLabel}>
                      <input
                        className={styles.checkboxInput}
                        type="checkbox"
                        checked={saveCard}
                        onChange={(event) => setSaveCard(event.target.checked)}
                      />
                      <span className={styles.checkboxCustom} />
                      <span>Сохранить реквизиты карты</span>
                    </label>

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

                  <div className={styles.illustration} aria-hidden="true">
                    <img
                      className={styles.illustrationImage}
                      src="/images/shop-payment/Frame_480_card.png"
                      alt=""
                    />
                  </div>
                </section>
              ) : null}

              {tab === 'sbp' ? (
                <section className={`${styles.paymentCard} ${styles.sbpCard}`}>
                  <p className={styles.sbpHint}>
                    Отсканируйте QR-код в приложении банка или подтвердите перевод по СБП
                  </p>

                  <div className={styles.sbpContent}>
                    <div className={styles.illustrationSbpLeft} aria-hidden="true">
                      <img
                        className={styles.sbpSideImage}
                        src="/images/shop-payment/Group_sbp_men.png"
                        alt=""
                      />
                    </div>

                    <div className={styles.qrFrame}>
                      <img
                        className={styles.qrCode}
                        src="/images/shop-checkout/f7_qrcode.svg"
                        alt=""
                        aria-hidden="true"
                      />
                    </div>

                    <div className={styles.illustrationSbpRight} aria-hidden="true">
                      <img
                        className={styles.sbpSideImage}
                        src="/images/shop-payment/Group_sbp_women.png"
                        alt=""
                      />
                    </div>
                  </div>
                </section>
              ) : null}

              {tab === 'card_courier' || tab === 'cash' ? (
                <section className={`${styles.paymentCard} ${styles.courierPaymentCard}`}>
                  <div className={styles.courierPayDecor} aria-hidden>
                    <img
                      className={styles.courierPayVector}
                      src="/images/shop-payment/courier_pay_vector.png"
                      alt=""
                    />
                    <img
                      className={styles.courierPayHero}
                      src="/images/shop-payment/courier_pay_illustration.png"
                      alt=""
                    />
                  </div>

                  <div className={styles.courierPaymentBody}>
                    <h2 className={styles.sectionTitle}>
                      {tab === 'card_courier'
                        ? 'Оплата картой курьеру'
                        : 'Оплата наличными курьеру'}
                    </h2>
                    <p className={styles.deliveryPayText}>
                      Оплата будет произведена при получении заказа. Подтвердите выбранный способ
                      оплаты, чтобы перейти к заказу.
                    </p>

                    <button
                      type="button"
                      className={styles.payButton}
                      disabled={isPaying}
                      onClick={() => {
                        void handlePay();
                      }}
                    >
                      {isPaying ? 'Сохраняем…' : 'Подтвердить способ оплаты'}
                    </button>
                  </div>
                </section>
              ) : null}
            </div>

            <aside className={styles.rightColumn}>
              <section className={styles.summaryCard}>
                <h2 className={styles.sectionTitle}>Ваш заказ</h2>

                <div className={styles.summaryList}>
                  {order.items.map((item) => (
                    <div key={item.product.id} className={styles.summaryItem}>
                      <div className={styles.summaryInfo}>
                        <span className={styles.summaryName}>{item.product.title}</span>
                        <span className={styles.summaryQty}>{item.quantity} шт.</span>
                      </div>

                      <span className={styles.summaryPrice}>{formatPrice(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryRow}>
                  <span>Количество товаров</span>
                  <strong>{totalQuantity} шт.</strong>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Итоговая сумма</span>
                  <strong>{formatPrice(order.totalPrice)}</strong>
                </div>
              </section>

              {tab === 'sbp' ? (
                <div className={styles.sbpAsideAction}>
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

                  <p className={styles.sbpAsideHint}>
                    После подтверждения в банке нажмите «Подтвердить оплату»
                  </p>
                </div>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}