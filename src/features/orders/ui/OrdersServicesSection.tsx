// src/features/orders/ui/OrdersServicesSection.tsx

import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { useAuth } from "@/features/auth/model/useAuth";
import { getMessagesViewerFromUser } from "@/features/messages/model/messagesViewer";
import { messagesStore } from "@/features/messages/model/messagesStore";

import { ordersStore } from "../model/ordersStore";
import type {
  LeaveServiceReviewPayload,
  OrderStatus,
  ServiceOrder,
  ServicesFilter,
} from "../model/types";

import styles from "./OrdersServicesSection.module.css";

import type { ChangeEvent, ReactElement } from "react";

type ViewerRole = "client" | "specialist" | "admin" | "super_admin";

type ProfileOrdersLocationState = {
  activeTab?: string;
  highlightedOrderId?: string;
  justCreatedOrderId?: string;
};

type Props = {
  viewerRole?: ViewerRole;
};

type ReviewDraftState = LeaveServiceReviewPayload;

const FILTERS: Array<{ value: ServicesFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "upcoming", label: "Будущие" },
  { value: "pending_confirmation", label: "Ждут подтверждения" },
  { value: "confirmed", label: "Подтверждённые" },
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершённые" },
  { value: "canceled", label: "Отменённые" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(isoOrDate: string): string {
  const value = isoOrDate.length === 10 ? `${isoOrDate}T00:00:00` : isoOrDate;

  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: OrderStatus): string {
  if (status === "pending_confirmation") {
    return "Ждёт подтверждения";
  }

  if (status === "confirmed") {
    return "Подтверждён";
  }

  if (status === "active") {
    return "Выполняется";
  }

  if (status === "completed") {
    return "Завершён";
  }

  if (status === "canceled") {
    return "Отменён";
  }

  return status;
}

function getStatusTone(status: OrderStatus): string {
  if (status === "pending_confirmation") {
    return styles.statusPending;
  }

  if (status === "confirmed") {
    return styles.statusConfirmed;
  }

  if (status === "active") {
    return styles.statusActive;
  }

  if (status === "completed") {
    return styles.statusCompleted;
  }

  if (status === "canceled") {
    return styles.statusCanceled;
  }

  return styles.statusNeutral;
}

function formatPrice(value: number, currency: "RUB"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBookingMode(mode: ServiceOrder["schedule"]["mode"]): string {
  if (mode === "fixed_slot") {
    return "Фиксированный слот";
  }

  if (mode === "time_range") {
    return "Произвольный интервал";
  }

  if (mode === "multi_day_stay") {
    return "Передержка";
  }

  if (mode === "open_request") {
    return "Свободный запрос";
  }

  return mode;
}

function buildOrderTimeLabel(order: ServiceOrder): string {
  if (order.schedule.mode === "fixed_slot") {
    const start = new Date(order.schedule.startAt);
    const end = new Date(order.schedule.endAt);

    const sameDay = start.toDateString() === end.toDateString();

    if (sameDay) {
      return `${start.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}, ${start.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })} – ${end.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return `${formatDateTime(order.schedule.startAt)} – ${formatDateTime(order.schedule.endAt)}`;
  }

  if (order.schedule.mode === "time_range") {
    return `${formatDateTime(order.schedule.startAt)} – ${formatDateTime(order.schedule.endAt)}`;
  }

  if (order.schedule.mode === "multi_day_stay") {
    return `Заезд: ${formatDateTime(order.schedule.checkInAt)} • Выезд: ${formatDateTime(order.schedule.checkOutAt)}`;
  }

  if (order.schedule.requestedDate) {
    const startTime = order.schedule.requestedStartTime
      ? `, c ${order.schedule.requestedStartTime}`
      : "";
    const endTime = order.schedule.requestedEndTime
      ? ` до ${order.schedule.requestedEndTime}`
      : "";

    return `${formatDateOnly(order.schedule.requestedDate)}${startTime}${endTime}`;
  }

  return "По согласованию со специалистом";
}

function buildOrderSecondaryLabel(order: ServiceOrder): string | null {
  if (order.schedule.mode === "multi_day_stay") {
    return `${order.schedule.stayDays} дн.`;
  }

  if (order.schedule.mode === "open_request") {
    return "Время будет согласовано после подтверждения";
  }

  if (order.schedule.mode === "time_range") {
    const start = new Date(order.schedule.startAt);
    const end = new Date(order.schedule.endAt);
    const durationMinutes = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
    );

    if (!durationMinutes) {
      return null;
    }

    if (durationMinutes % 60 === 0) {
      return `${durationMinutes / 60} ч`;
    }

    return `${durationMinutes} мин`;
  }

  return null;
}

function canLeaveReview(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return (
    viewerRole === "client" && order.status === "completed" && !order.hasReview
  );
}

function canRepeat(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === "client" && order.status === "completed";
}

function canCancel(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return (
    viewerRole === "client" &&
    (order.status === "pending_confirmation" || order.status === "confirmed")
  );
}

function canConfirm(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === "specialist" && order.status === "pending_confirmation";
}

function canStart(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === "specialist" && order.status === "confirmed";
}

function canComplete(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === "specialist" && order.status === "active";
}

function isRelevantProfileState(
  state: ProfileOrdersLocationState | null,
): boolean {
  if (!state) {
    return false;
  }

  return Boolean(
    state.highlightedOrderId || state.justCreatedOrderId || state.activeTab,
  );
}

function getDefaultReviewDraft(): ReviewDraftState {
  return {
    rating: 5,
    comment: "",
    photos: [],
  };
}

function renderStars(rating: number): string {
  const safeRating = Math.max(1, Math.min(5, rating));

  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Не удалось прочитать изображение."));
    };

    reader.onerror = () => {
      reject(new Error("Не удалось прочитать изображение."));
    };

    reader.readAsDataURL(file);
  });
}

export const OrdersServicesSection = observer(
  ({ viewerRole = "client" }: Props): ReactElement => {
    const isSpecialistViewer = viewerRole === "specialist";
    const navigate = useAppNavigate();
    const location = useLocation();
    const { specialistSlug: specialistSlugParam } = useParams<{
      specialistSlug?: string;
    }>();
    const { user } = useAuth();
    const specialistSlug = specialistSlugParam?.trim() ?? "";
    const locationState =
      (location.state as ProfileOrdersLocationState | null) ?? null;

    const [reviewDrafts, setReviewDrafts] = useState<
      Record<string, ReviewDraftState>
    >({});
    const [freshOrderId, setFreshOrderId] = useState<string | null>(
      locationState?.justCreatedOrderId ?? null,
    );

    const orderRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
      void ordersStore.loadServices();
    }, []);

    useEffect(() => {
      if (
        !locationState?.highlightedOrderId &&
        !locationState?.justCreatedOrderId
      ) {
        return;
      }

      const targetId =
        locationState.justCreatedOrderId ?? locationState.highlightedOrderId;

      if (!targetId) {
        return;
      }

      const timer = window.setTimeout(() => {
        const node = orderRefs.current[targetId];

        if (node) {
          node.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }
      }, 150);

      if (locationState.justCreatedOrderId) {
        setFreshOrderId(locationState.justCreatedOrderId);

        const clearFreshTimer = window.setTimeout(() => {
          setFreshOrderId(null);
        }, 3500);

        return () => {
          window.clearTimeout(timer);
          window.clearTimeout(clearFreshTimer);
        };
      }

      return () => {
        window.clearTimeout(timer);
      };
    }, [
      location.key,
      locationState?.highlightedOrderId,
      locationState?.justCreatedOrderId,
      ordersStore.serviceOrders.length,
    ]);

    useEffect(() => {
      if (!isRelevantProfileState(locationState)) {
        return;
      }

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }, [location.pathname, locationState, navigate]);

    const serviceOrders = useMemo(() => {
      return ordersStore.serviceOrders;
    }, [ordersStore.serviceOrders]);

    const handleSetFilter = (filter: ServicesFilter): void => {
      ordersStore.setServicesFilter(filter);
    };

    const handleRepeat = async (orderId: string): Promise<void> => {
      await ordersStore.repeatService(orderId);

      if (ordersStore.actionError) {
        return;
      }

      navigate(`/service-booking?repeat=${encodeURIComponent(orderId)}`);
    };

    const handleReviewFieldChange = (
      orderId: string,
      field: keyof LeaveServiceReviewPayload,
      value: LeaveServiceReviewPayload[keyof LeaveServiceReviewPayload],
    ): void => {
      setReviewDrafts((prev) => {
        const current = prev[orderId] ?? getDefaultReviewDraft();

        return {
          ...prev,
          [orderId]: {
            ...current,
            [field]: value,
          } as ReviewDraftState,
        };
      });
    };

    const handleReviewPhotosChange = async (
      orderId: string,
      event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
      const files = event.target.files;

      if (!files || files.length === 0) {
        return;
      }

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (imageFiles.length === 0) {
        event.target.value = "";
        return;
      }

      try {
        const nextPhotos = await Promise.all(
          imageFiles.slice(0, 6).map((file) => readFileAsDataUrl(file)),
        );

        setReviewDrafts((prev) => {
          const current = prev[orderId] ?? getDefaultReviewDraft();

          return {
            ...prev,
            [orderId]: {
              ...current,
              photos: [...current.photos, ...nextPhotos].slice(0, 6),
            },
          };
        });
      } finally {
        event.target.value = "";
      }
    };

    const handleRemoveReviewPhoto = (
      orderId: string,
      photoIndex: number,
    ): void => {
      setReviewDrafts((prev) => {
        const current = prev[orderId] ?? getDefaultReviewDraft();

        return {
          ...prev,
          [orderId]: {
            ...current,
            photos: current.photos.filter((_, index) => index !== photoIndex),
          },
        };
      });
    };

    const handleLeaveReview = async (orderId: string): Promise<void> => {
      const currentDraft = reviewDrafts[orderId] ?? getDefaultReviewDraft();

      const payload: LeaveServiceReviewPayload = {
        rating: currentDraft.rating,
        comment: currentDraft.comment.trim(),
        photos: currentDraft.photos,
      };

      if (!payload.comment) {
        return;
      }

      await ordersStore.leaveReview(orderId, payload);

      if (ordersStore.actionError) {
        return;
      }

      setReviewDrafts((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    };

    const openSpecialistProfile = (specialistSlugValue: string): void => {
      navigate(`/specialists/${specialistSlugValue}`, {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });
    };

    const openClientProfile = (order: ServiceOrder): void => {
      const slug = specialistSlug || order.specialistSlug;
      const clientKey = order.clientSlug || order.clientId;
      if (!slug || !clientKey) {
        return;
      }

      navigate(
        `/specialists/${slug}/clients/${encodeURIComponent(clientKey)}`,
        {
          state: {
            from: `${location.pathname}${location.search}`,
          },
        },
      );
    };

    const handleContactClient = async (order: ServiceOrder): Promise<void> => {
      if (!user?.id) {
        return;
      }

      await messagesStore.startChatWithClient({
        viewer: getMessagesViewerFromUser(user),
        clientId: order.clientId,
        clientName: order.clientName,
      });

      navigate("/messages");
    };

    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isSpecialistViewer ? "Заказы клиентов" : "Заказы услуг"}
            </h2>
            <p className={styles.subtitle}>
              {isSpecialistViewer
                ? "Новые заявки, подтверждённые и активные визиты, завершённые заказы и отзывы клиентов — в одном списке."
                : "Здесь собраны все этапы заказа: создание, подтверждение, выполнение, завершение, отзыв и повторный заказ."}
            </p>
          </div>
        </div>

        <div className={styles.filters}>
          {FILTERS.map((filter) => {
            const isActive = ordersStore.servicesFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                className={
                  isActive ? styles.filterButtonActive : styles.filterButton
                }
                onClick={() => {
                  handleSetFilter(filter.value);
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {ordersStore.servicesError ? (
          <div className={styles.errorBox}>{ordersStore.servicesError}</div>
        ) : null}

        {ordersStore.actionError ? (
          <div className={styles.errorBox}>{ordersStore.actionError}</div>
        ) : null}

        {ordersStore.servicesLoading ? (
          <div className={styles.loadingBox}>Загружаем заказы...</div>
        ) : null}

        {!ordersStore.servicesLoading && serviceOrders.length === 0 ? (
          <div className={styles.emptyState}>
            По выбранному фильтру заказов пока нет.
          </div>
        ) : null}

        <div className={styles.listScroll}>
          <div className={styles.list}>
            {serviceOrders.map((order) => {
              const loadingThisCard = ordersStore.actionLoadingId === order.id;
              const currentReviewDraft =
                reviewDrafts[order.id] ?? getDefaultReviewDraft();
              const isFresh = freshOrderId === order.id;
              const secondaryLabel = buildOrderSecondaryLabel(order);

              return (
                <article
                  key={order.id}
                  ref={(node) => {
                    orderRefs.current[order.id] = node;
                  }}
                  className={isFresh ? styles.cardFresh : styles.card}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderMain}>
                      <div className={styles.orderTitleRow}>
                        <h3 className={styles.orderTitle}>
                          {order.serviceTitle}
                        </h3>
                        <span
                          className={`${styles.statusBadge} ${getStatusTone(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>

                      <div className={styles.metaGrid}>
                        {isSpecialistViewer ? (
                          <>
                            <div className={styles.metaItem}>
                              <span className={styles.metaLabel}>Номер заказа</span>
                              <span className={styles.metaValue}>{order.id}</span>
                            </div>
                            <div className={styles.metaItem}>
                              <span className={styles.metaLabel}>Клиент</span>
                              <button
                                type="button"
                                className={styles.inlineLinkButton}
                                onClick={() => {
                                  openClientProfile(order);
                                }}
                              >
                                {order.clientName}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Специалист</span>
                            <button
                              type="button"
                              className={styles.inlineLinkButton}
                              onClick={() => {
                                openSpecialistProfile(order.specialistSlug);
                              }}
                            >
                              {order.sitterName}
                            </button>
                          </div>
                        )}

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Питомец</span>
                          <span className={styles.metaValue}>
                            {order.petName}
                          </span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>
                            Формат бронирования
                          </span>
                          <span className={styles.metaValue}>
                            {formatBookingMode(order.schedule.mode)}
                          </span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Дата и время</span>
                          <span className={styles.metaValue}>
                            {buildOrderTimeLabel(order)}
                          </span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>
                            Формат услуги
                          </span>
                          <span className={styles.metaValue}>
                            {order.locationLabel}
                          </span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Стоимость</span>
                          <span className={styles.metaValue}>
                            {formatPrice(order.price, order.currency)}
                          </span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Создан</span>
                          <span className={styles.metaValue}>
                            {formatDateTime(order.createdAt)}
                          </span>
                        </div>

                        {secondaryLabel ? (
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>
                              Дополнительно
                            </span>
                            <span className={styles.metaValue}>
                              {secondaryLabel}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {order.comment ? (
                        <div className={styles.commentBox}>
                          <span className={styles.metaLabel}>Комментарий</span>
                          <p className={styles.commentText}>{order.comment}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className={styles.timeline}>
                    {order.lifecycle.map((item, index) => (
                      <div
                        key={`${order.id}-${item.status}-${item.changedAt}-${index}`}
                        className={styles.timelineItem}
                      >
                        <span className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineTitle}>
                            {formatStatus(item.status)}
                          </div>
                          <div className={styles.timelineDate}>
                            {formatDateTime(item.changedAt)}
                          </div>
                          {item.comment ? (
                            <div className={styles.timelineComment}>
                              {item.comment}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.actions}>
                    {!isSpecialistViewer ? (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => {
                          openSpecialistProfile(order.specialistSlug);
                        }}
                      >
                        Перейти в профиль петситтера
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => {
                            openClientProfile(order);
                          }}
                        >
                          Профиль клиента
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={!user?.id}
                          onClick={() => {
                            void handleContactClient(order);
                          }}
                        >
                          Связаться
                        </button>
                      </>
                    )}

                    {canCancel(order, viewerRole) ? (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={loadingThisCard}
                        onClick={() => {
                          void ordersStore.cancelService(order.id);
                        }}
                      >
                        Отменить заказ
                      </button>
                    ) : null}

                    {canConfirm(order, viewerRole) ? (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={loadingThisCard}
                        onClick={() => {
                          void ordersStore.confirmService(order.id);
                        }}
                      >
                        Подтвердить
                      </button>
                    ) : null}

                    {canStart(order, viewerRole) ? (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={loadingThisCard}
                        onClick={() => {
                          void ordersStore.startService(order.id);
                        }}
                      >
                        Начать выполнение
                      </button>
                    ) : null}

                    {canComplete(order, viewerRole) ? (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={loadingThisCard}
                        onClick={() => {
                          void ordersStore.completeService(order.id);
                        }}
                      >
                        Завершить заказ
                      </button>
                    ) : null}

                    {canRepeat(order, viewerRole) ? (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={loadingThisCard}
                        onClick={() => {
                          void handleRepeat(order.id);
                        }}
                      >
                        Повторить заказ
                      </button>
                    ) : null}
                  </div>

                  {order.review ? (
                    <div className={styles.reviewView}>
                      <div className={styles.reviewViewHeader}>
                        <div className={styles.reviewViewTitle}>
                          {isSpecialistViewer ? "Отзыв клиента" : "Ваш отзыв"}
                        </div>
                        <div className={styles.reviewViewRating}>
                          {renderStars(order.review.rating)} (
                          {order.review.rating}/5)
                        </div>
                      </div>

                      <div className={styles.reviewViewDate}>
                        {formatDateTime(order.review.createdAt)}
                      </div>

                      <div className={styles.reviewViewComment}>
                        {order.review.comment}
                      </div>

                      {order.review.photos.length > 0 ? (
                        <div className={styles.reviewPhotosGrid}>
                          {order.review.photos.map((photo, index) => (
                            <img
                              key={`${order.id}-review-photo-${index}`}
                              className={styles.reviewPhoto}
                              src={photo}
                              alt={`Фото к отзыву ${index + 1}`}
                            />
                          ))}
                        </div>
                      ) : null}

                      {order.review.specialistReply ? (
                        <details className={styles.replyDetails}>
                          <summary className={styles.replySummary}>
                            Ответ специалиста
                          </summary>

                          <div className={styles.replyBody}>
                            <div className={styles.replyDate}>
                              {formatDateTime(
                                order.review.specialistReply.createdAt,
                              )}
                            </div>
                            <div className={styles.replyComment}>
                              {order.review.specialistReply.comment}
                            </div>
                          </div>
                        </details>
                      ) : null}
                    </div>
                  ) : null}

                  {canLeaveReview(order, viewerRole) ? (
                    <div className={styles.reviewBox}>
                      <div className={styles.reviewTitle}>Оставить отзыв</div>

                      <div className={styles.reviewControls}>
                        <label className={styles.reviewLabel}>
                          Оценка
                          <select
                            className={styles.select}
                            value={currentReviewDraft.rating}
                            onChange={(event) => {
                              handleReviewFieldChange(
                                order.id,
                                "rating",
                                Number(event.target.value) as 1 | 2 | 3 | 4 | 5,
                              );
                            }}
                          >
                            <option value={5}>5</option>
                            <option value={4}>4</option>
                            <option value={3}>3</option>
                            <option value={2}>2</option>
                            <option value={1}>1</option>
                          </select>
                        </label>
                      </div>

                      <label className={styles.reviewTextLabel}>
                        Комментарий
                        <textarea
                          className={styles.textarea}
                          value={currentReviewDraft.comment}
                          onChange={(event) => {
                            handleReviewFieldChange(
                              order.id,
                              "comment",
                              event.target.value,
                            );
                          }}
                          placeholder="Опишите, как прошла услуга"
                          rows={4}
                        />
                      </label>

                      <div className={styles.reviewPhotosBlock}>
                        <div className={styles.reviewPhotosTitle}>
                          Фото к отзыву
                        </div>

                        <label className={styles.uploadButton}>
                          Добавить фото
                          <input
                            className={styles.hiddenInput}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) => {
                              void handleReviewPhotosChange(order.id, event);
                            }}
                          />
                        </label>

                        {currentReviewDraft.photos.length > 0 ? (
                          <div className={styles.reviewDraftPhotosGrid}>
                            {currentReviewDraft.photos.map((photo, index) => (
                              <div
                                key={`${order.id}-draft-photo-${index}`}
                                className={styles.reviewDraftPhotoCard}
                              >
                                <img
                                  className={styles.reviewDraftPhoto}
                                  src={photo}
                                  alt={`Черновик фото ${index + 1}`}
                                />
                                <button
                                  type="button"
                                  className={styles.removePhotoButton}
                                  onClick={() => {
                                    handleRemoveReviewPhoto(order.id, index);
                                  }}
                                >
                                  Удалить
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.reviewHint}>
                            Можно добавить несколько изображений.
                          </div>
                        )}
                      </div>

                      <div className={styles.reviewActions}>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          disabled={
                            loadingThisCard ||
                            currentReviewDraft.comment.trim().length === 0
                          }
                          onClick={() => {
                            void handleLeaveReview(order.id);
                          }}
                        >
                          Отправить отзыв
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {order.status === "completed" &&
                  order.hasReview &&
                  !order.review ? (
                    <div className={styles.successBox}>Отзыв уже оставлен.</div>
                  ) : null}

                  {isFresh ? (
                    <div className={styles.freshBadge}>
                      Новый заказ успешно создан
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
);
