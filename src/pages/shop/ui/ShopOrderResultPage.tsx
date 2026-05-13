// src/pages/shop/ui/ShopOrderResultPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useState, type ChangeEvent, type JSX } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ordersStore } from '@/features/orders/model/ordersStore';
import { canCancelProductOrder } from '@/features/orders/model/types';

import styles from './ShopOrderResultPage.module.css';

type ProductOrderStatus = 'created' | 'paid' | 'shipped' | 'delivered' | 'canceled';
const ORDER_STATUS_AUTO_REFRESH_MS = 90_000;

const STAR_EMPTY_SRC = '/images/shop-order/star-empty.svg';
const STAR_FILLED_SRC = '/images/shop-order/star-filled.svg';
const STAR_INDICES = [1, 2, 3, 4, 5] as const;
const MAX_REVIEW_PHOTOS = 5;

type DeliveryMethod = 'courier' | 'pickup';

type ProductOrderView = {
  id: string;
  number: string;
  status: ProductOrderStatus;
  createdAt: string;
  price: number;
  cancelReason?: string;
  canceledAt?: string;
  canBeCancelled?: boolean;
  recipient?: {
    fullName: string;
    phone: string;
  };
  delivery?: {
    method: DeliveryMethod;
    address?: {
      city: string;
      street: string;
      house: string;
      apartment?: string;
    };
    pickupPointLabel?: string;
    trackingNumber?: string;
  };
  payment?: {
    method?: string;
    status?: string;
  };
  items: Array<{
    productId: string;
    variantId?: string;
    title: string;
    quantity: number;
    price: number;
    variantLabel?: string;
    imageUrl?: string;
  }>;
  lifecycle?: Array<{
    status: string;
    changedAt: string;
    comment?: string;
  }>;
};

type StatusStep = {
  key: ProductOrderStatus;
  label: string;
  date?: string;
};

type SubmittedProductReview = {
  rating: number;
  text: string;
  photos: string[];
};

type ReviewModalState = {
  itemKey: string;
  item: ProductOrderView['items'][number];
  mode: 'compose' | 'view';
};

export const ShopOrderResultPage = observer(() => {
  const { orderId } = useParams<{ orderId: string }>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [reviewModal, setReviewModal] = useState<ReviewModalState | null>(null);
  const [reviewDraftRating, setReviewDraftRating] = useState(0);
  const [reviewDraftText, setReviewDraftText] = useState('');
  const [reviewDraftPhotos, setReviewDraftPhotos] = useState<string[]>([]);
  const [itemReviewByKey, setItemReviewByKey] = useState<
    Record<string, SubmittedProductReview>
  >({});

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

    void ordersStore.loadProductById(orderId);

    return () => {
      ordersStore.clearSelectedProductOrder();
    };
  }, [orderId]);

  const order = ordersStore.selectedProductOrder as ProductOrderView | null;
  const isLoading = ordersStore.selectedProductLoading;
  const error = ordersStore.selectedProductError;
  const isActionLoading = order ? ordersStore.actionLoadingId === order.id : false;
  const showCancelOrderControl =
    order !== null &&
    (order.status === 'canceled' || canCancelProductOrder(order));

  useEffect(() => {
    if (!orderId || isLoading || error || !order) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void ordersStore.syncSelectedProductOrderStatus();
    }, ORDER_STATUS_AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [orderId, isLoading, error, order]);

  useEffect(() => {
    if (!isCancelModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCancelModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isCancelModalOpen]);

  useEffect(() => {
    if (!reviewModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setReviewModal(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [reviewModal]);

  const handleRequestCancel = (): void => {
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = (): void => {
    if (isActionLoading) {
      return;
    }

    setIsCancelModalOpen(false);
  };

  const handleConfirmCancel = async (): Promise<void> => {
    if (!order) {
      return;
    }

    await ordersStore.cancelProduct(order.id);

    if (ordersStore.selectedProductOrder?.status === 'canceled') {
      setIsCancelModalOpen(false);
    }
  };

  const openReviewModal = (
    itemKey: string,
    item: ProductOrderView['items'][number],
    fromStar: number,
  ): void => {
    const submitted = itemReviewByKey[itemKey];
    if (submitted) {
      setReviewModal({ itemKey, item, mode: 'view' });
      return;
    }

    setReviewModal({ itemKey, item, mode: 'compose' });
    setReviewDraftRating(Math.max(fromStar, 1));
    setReviewDraftText('');
    setReviewDraftPhotos([]);
  };

  const closeReviewModal = (): void => {
    if (reviewModal?.mode === 'compose') {
      setReviewDraftPhotos((photos) => {
        photos.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    }

    setReviewModal(null);
  };

  const handleReviewPhotosChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    setReviewDraftPhotos((prev) => {
      const next = [...prev];
      for (const file of files) {
        if (next.length >= MAX_REVIEW_PHOTOS) {
          break;
        }
        if (!file.type.startsWith('image/')) {
          continue;
        }
        next.push(URL.createObjectURL(file));
      }
      return next;
    });
  };

  const removeDraftPhoto = (index: number): void => {
    setReviewDraftPhotos((prev) => {
      const url = prev[index];
      if (url) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitReview = (): void => {
    if (!reviewModal || reviewModal.mode !== 'compose' || reviewDraftRating < 1) {
      return;
    }

    setItemReviewByKey((prev) => ({
      ...prev,
      [reviewModal.itemKey]: {
        rating: reviewDraftRating,
        text: reviewDraftText.trim(),
        photos: [...reviewDraftPhotos],
      },
    }));
    setReviewDraftPhotos([]);
    setReviewModal(null);
  };

  const reviewModalSubmitted =
    reviewModal?.mode === 'view' ? itemReviewByKey[reviewModal.itemKey] : undefined;

  return (
    <main className={styles.page}>
      <div className={styles.blur} />

      <div className={styles.container}>
        {isLoading ? (
          <section className={styles.stateCard}>
            <h1 className={styles.pageTitle}>Загружаем заказ</h1>
            <p className={styles.stateText}>Подготавливаем информацию о заказе.</p>
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className={styles.stateCard}>
            <h1 className={styles.pageTitle}>Не удалось открыть заказ</h1>
            <p className={styles.stateText}>{error}</p>

            <Link to="/shop" className={styles.primaryButton}>
              Вернуться в магазин
            </Link>
          </section>
        ) : null}

        {!isLoading && !error && order ? (
          <>
            <h1 className={styles.pageTitle}>Детали заказа</h1>

            <div className={styles.layout}>
              <div className={styles.leftColumn}>
                <section className={styles.detailsCard}>
                  <div className={styles.detailsHeader}>
                    <h2 className={styles.cardTitle}>
                      Заказ №{formatOrderNumberForTitle(order.number)}
                    </h2>
                    <span className={styles.dateBadge}>
                      {formatCompactDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className={styles.detailsGrid}>
                    <InfoBlock label="Получатель" value={getRecipientLabel(order)} />
                    <InfoBlock
                      label="Доставка"
                      value={getDeliveryPeriodLabel(order)}
                    />
                    <InfoBlock label="Адрес" value={getAddressLabel(order)} />
                    <InfoBlock
                      label="Оплата"
                      value={getPaymentLabel(order.payment?.method)}
                    />
                  </div>

                  <div className={styles.actions}>
                    {showCancelOrderControl ? (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={
                          order.status === 'canceled' ||
                          isActionLoading ||
                          !canCancelProductOrder(order)
                        }
                        onClick={handleRequestCancel}
                      >
                        {order.status === 'canceled'
                          ? 'Заказ отменен'
                          : isActionLoading
                            ? 'Отменяем...'
                            : 'Отменить заказ'}
                      </button>
                    ) : null}

                    <Link to="/shop" className={styles.primaryButton}>
                      Продолжить покупки
                    </Link>
                  </div>
                </section>

                <section className={styles.statusCard}>
                  <h2 className={styles.cardTitle}>Статус заказа</h2>

                  <OrderStatusTimeline order={order} />
                </section>
              </div>

              <aside className={styles.summaryCard}>
                <h2 className={styles.cardTitle}>Ваш заказ</h2>

                <div className={styles.summaryList}>
                  {order.items.map((item, index) => {
                    const itemKey = getProductLineKey(item, index);
                    const submittedReview = itemReviewByKey[itemKey];
                    const savedRating = submittedReview?.rating ?? 0;

                    return (
                      <div
                        key={itemKey}
                        className={styles.summaryItem}
                      >
                        <div className={styles.summaryItemTop}>
                          <div className={styles.summaryMeta}>
                            <span className={styles.summaryName}>{item.title}</span>
                            <span className={styles.summaryQuantity}>
                              {item.quantity} шт.
                            </span>
                          </div>

                          <span className={styles.summaryPrice}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        {order.status === 'delivered' ? (
                          <div
                            className={styles.summaryStars}
                            role="group"
                            aria-label="Оценка товара"
                          >
                            {STAR_INDICES.map((star) => (
                              <button
                                key={star}
                                type="button"
                                className={styles.starButton}
                                aria-label={
                                  submittedReview
                                    ? `Просмотреть отзыв, оценка ${savedRating} из 5`
                                    : `Оценить ${star} из 5`
                                }
                                onClick={() => {
                                  openReviewModal(itemKey, item, star);
                                }}
                              >
                                <img
                                  src={star <= savedRating ? STAR_FILLED_SRC : STAR_EMPTY_SRC}
                                  alt=""
                                  width={28}
                                  height={28}
                                  className={styles.starImg}
                                />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryRow}>
                  <span>Количество товаров</span>
                  <strong>{getTotalItems(order)} шт.</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>Итоговая сумма</span>
                  <strong className={styles.totalPrice}>{formatPrice(order.price)}</strong>
                </div>
              </aside>
            </div>

            {isCancelModalOpen ? (
              <div
                className={styles.cancelModalOverlay}
                onClick={handleCloseCancelModal}
                role="presentation"
              >
                <section
                  className={styles.cancelModal}
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="cancel-order-title"
                >
                  <button
                    type="button"
                    className={styles.cancelModalClose}
                    onClick={handleCloseCancelModal}
                    aria-label="Закрыть окно"
                  >
                    <span className={styles.cancelModalCloseIcon} />
                  </button>

                  <h2 id="cancel-order-title" className={styles.cancelModalTitle}>
                    Отмена заказа
                  </h2>
                  <p className={styles.cancelModalText}>
                    Вы уверены, что хотите отменить заказ?
                  </p>

                  {ordersStore.actionError ? (
                    <p className={styles.cancelModalError}>{ordersStore.actionError}</p>
                  ) : null}

                  <button
                    type="button"
                    className={styles.cancelModalConfirm}
                    disabled={isActionLoading}
                    onClick={() => {
                      void handleConfirmCancel();
                    }}
                  >
                    {isActionLoading ? 'Отменяем...' : 'Отменить заказ'}
                  </button>
                </section>
              </div>
            ) : null}

            {reviewModal ? (
              <div
                className={styles.reviewOverlay}
                onClick={closeReviewModal}
                role="presentation"
              >
                <section
                  className={styles.reviewModal}
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="product-review-title"
                >
                  <button
                    type="button"
                    className={styles.reviewModalClose}
                    onClick={closeReviewModal}
                    aria-label="Закрыть"
                  >
                    <span className={styles.reviewModalCloseIcon} />
                  </button>

                  <h2 id="product-review-title" className={styles.reviewModalTitle}>
                    {reviewModal.mode === 'view' ? 'Ваш отзыв' : 'Отзыв на товар'}
                  </h2>

                  <div className={styles.reviewProductRow}>
                    <div className={styles.reviewThumb}>
                      {reviewModal.item.imageUrl ? (
                        <img
                          src={reviewModal.item.imageUrl}
                          alt=""
                          className={styles.reviewThumbImg}
                        />
                      ) : null}
                    </div>

                    <div className={styles.reviewProductMeta}>
                      <p className={styles.reviewProductName}>{reviewModal.item.title}</p>

                      <div
                        className={styles.reviewModalStars}
                        role="group"
                        aria-label={
                          reviewModal.mode === 'view' && reviewModalSubmitted
                            ? `Оценка ${reviewModalSubmitted.rating} из 5`
                            : 'Оценка'
                        }
                      >
                        {reviewModal.mode === 'view' && reviewModalSubmitted ? (
                          STAR_INDICES.map((star) => (
                            <span
                              key={star}
                              className={styles.reviewModalStarStatic}
                              aria-hidden={true}
                            >
                              <img
                                src={
                                  star <= reviewModalSubmitted.rating
                                    ? STAR_FILLED_SRC
                                    : STAR_EMPTY_SRC
                                }
                                alt=""
                                width={28}
                                height={28}
                                className={styles.starImg}
                              />
                            </span>
                          ))
                        ) : (
                          STAR_INDICES.map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={styles.starButton}
                              aria-label={`${star} из 5`}
                              onClick={() => {
                                setReviewDraftRating(star);
                              }}
                            >
                              <img
                                src={
                                  star <= reviewDraftRating
                                    ? STAR_FILLED_SRC
                                    : STAR_EMPTY_SRC
                                }
                                alt=""
                                width={28}
                                height={28}
                                className={styles.starImg}
                              />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {reviewModal.mode === 'view' && reviewModalSubmitted ? (
                    <>
                      <p className={styles.reviewFieldLabel}>Отзыв</p>
                      <p className={styles.reviewTextReadonly}>
                        {reviewModalSubmitted.text || 'Текст отзыва не указан.'}
                      </p>

                      <p className={styles.reviewFieldLabel}>Фотографии</p>
                      <div className={styles.reviewPhotosRow}>
                        {reviewModalSubmitted.photos.length > 0 ? (
                          reviewModalSubmitted.photos.map((url) => (
                            <div key={url} className={styles.reviewPhotoPreview}>
                              <img
                                src={url}
                                alt=""
                                className={styles.reviewPhotoPreviewImg}
                              />
                            </div>
                          ))
                        ) : (
                          <p className={styles.reviewPhotosEmpty}>Фото не прикреплены.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <label className={styles.reviewFieldLabel} htmlFor="product-review-text">
                        Отзыв
                      </label>
                      <textarea
                        id="product-review-text"
                        className={styles.reviewTextarea}
                        rows={3}
                        placeholder="Поделитесь впечатлениями от товаре"
                        value={reviewDraftText}
                        onChange={(event) => {
                          setReviewDraftText(event.target.value);
                        }}
                      />

                      <p className={styles.reviewFieldLabel}>
                        Фотографии
                        <span className={styles.reviewPhotoHint}>
                          {' '}
                          (не более {MAX_REVIEW_PHOTOS} файлов)
                        </span>
                      </p>
                      <div className={styles.reviewPhotosRow}>
                        {reviewDraftPhotos.map((url, index) => (
                          <div key={url} className={styles.reviewPhotoPreview}>
                            <img
                              src={url}
                              alt=""
                              className={styles.reviewPhotoPreviewImg}
                            />
                            <button
                              type="button"
                              className={styles.reviewPhotoRemove}
                              onClick={() => {
                                removeDraftPhoto(index);
                              }}
                              aria-label="Удалить фото"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {reviewDraftPhotos.length < MAX_REVIEW_PHOTOS ? (
                          <label className={styles.reviewPhotoUpload}>
                            <span className={styles.reviewPhotoUploadIcon} aria-hidden />
                            <span className={styles.reviewPhotoUploadText}>
                              Загрузите фото
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className={styles.reviewPhotoFileInput}
                              onChange={handleReviewPhotosChange}
                            />
                          </label>
                        ) : null}
                      </div>
                    </>
                  )}

                  <div className={styles.reviewModalActions}>
                    {reviewModal.mode === 'view' ? (
                      <button
                        type="button"
                        className={styles.reviewSecondaryBtn}
                        onClick={closeReviewModal}
                      >
                        Закрыть
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.reviewSecondaryBtn}
                          onClick={closeReviewModal}
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          className={styles.reviewPrimaryBtn}
                          disabled={reviewDraftRating < 1}
                          onClick={handleSubmitReview}
                        >
                          Отправить
                        </button>
                      </>
                    )}
                  </div>
                </section>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
});

function formatOrderNumberForTitle(number: string): string {
  return number.trim().replace(/^№\s*/u, '');
}

function getProductLineKey(
  item: ProductOrderView['items'][number],
  index: number,
): string {
  return `${item.productId}-${item.variantId ?? 'default'}-${index}`;
}

function InfoBlock(props: { label: string; value: string }): JSX.Element {
  return (
    <div className={styles.infoBlock}>
      <span className={styles.infoLabel}>{props.label}</span>
      <span className={styles.infoValue}>{props.value}</span>
    </div>
  );
}

function OrderStatusTimeline(props: { order: ProductOrderView }): JSX.Element {
  const steps = getStatusSteps(props.order);
  const currentIndex = getCurrentStepIndex(props.order, steps);
  const progressWidth = steps.length > 1 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%';

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineLine}>
        <div className={styles.timelineProgress} style={{ width: progressWidth }} />
      </div>

      <div className={styles.timelineSteps}>
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;

          return (
            <div key={step.key} className={styles.timelineStep}>
              <span
                className={
                  isActive ? styles.timelineDotActive : styles.timelineDotInactive
                }
              />

              <span
                className={
                  isActive ? styles.timelineLabelActive : styles.timelineLabelInactive
                }
              >
                {step.label}
              </span>

              {step.date ? (
                <span className={styles.timelineDate}>
                  {formatDateTime(step.date)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStatusSteps(order: ProductOrderView): StatusStep[] {
  const isPickup = order.delivery?.method === 'pickup';
  const baseStatuses: ProductOrderStatus[] = ['created', 'paid', 'shipped', 'delivered'];

  const steps: StatusStep[] = baseStatuses.map((status) => ({
    key: status,
    label: getStatusLabel(status, isPickup),
    date: status === 'created' ? getLifecycleDate(order, status) ?? order.createdAt : getLifecycleDate(order, status),
  }));

  if (order.status === 'canceled') {
    const reachedCount = getReachedBaseStatusesCount(order, baseStatuses);
    const truncated = steps.slice(0, reachedCount);

    truncated.push({
      key: 'canceled',
      label: 'Отменён',
      date: getLifecycleDate(order, 'canceled') ?? order.canceledAt,
    });

    return truncated;
  }

  return steps;
}

function getLifecycleDate(order: ProductOrderView, status: string): string | undefined {
  return order.lifecycle?.find((event) => event.status === status)?.changedAt;
}

function getStatusLabel(status: ProductOrderStatus, isPickup: boolean): string {
  if (status === 'created') {
    return 'Создан';
  }
  if (status === 'paid') {
    return 'Собран и проверен';
  }
  if (status === 'shipped') {
    return isPickup ? 'Передан в СДЭК' : 'Передан курьеру';
  }
  if (status === 'delivered') {
    return 'Получен';
  }
  return 'Отменён';
}

function getReachedBaseStatusesCount(
  order: ProductOrderView,
  baseStatuses: ProductOrderStatus[],
): number {
  const reached = baseStatuses.filter((status) => {
    if (status === 'created') {
      return true;
    }
    return Boolean(getLifecycleDate(order, status));
  });

  return Math.max(1, reached.length);
}

function getCurrentStepIndex(order: ProductOrderView, steps: StatusStep[]): number {
  if (steps.length <= 1) {
    return 0;
  }

  if (order.status === 'canceled') {
    return steps.length - 1;
  }

  const statusToStep: Record<ProductOrderStatus, number> = {
    created: 0,
    paid: 1,
    shipped: 2,
    delivered: 3,
    canceled: 0,
  };

  return Math.min(statusToStep[order.status], steps.length - 1);
}

function getRecipientLabel(order: ProductOrderView): string {
  return order.recipient?.fullName ?? 'Не указан';
}

function getTotalItems(order: ProductOrderView): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatCompactDateTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(value))
    .replace(',', '');
}

function getDeliveryPeriodLabel(order: ProductOrderView): string {
  if (order.status === 'delivered') {
    return 'Доставлен';
  }

  return 'с 21 апреля - по 24 апреля';
}

function getPaymentLabel(value?: string): string {
  switch (value) {
    case 'card':
      return 'Банковская карта';
    case 'sbp':
      return 'СБП';
    case 'cash_on_delivery':
      return 'Наличными при получении';
    case 'card_on_delivery':
      return 'Картой курьеру';
    default:
      return 'Уточняется';
  }
}

function getAddressLabel(order: ProductOrderView): string {
  if (order.delivery?.method === 'pickup') {
    return order.delivery.pickupPointLabel ?? 'ПВЗ СДЭК';
  }

  if (order.delivery?.address) {
    const { city, street, house, apartment } = order.delivery.address;

    return [city, street, house, apartment ? `кв. ${apartment}` : '']
      .filter(Boolean)
      .join(', ');
  }

  return 'Адрес уточняется';
}
