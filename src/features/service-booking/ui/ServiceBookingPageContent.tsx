// src/features/service-booking/ui/ServiceBookingPageContent.tsx

import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { serviceBookingStore } from "../model/serviceBookingStore";
import type { ServiceBookingLocationState } from "../model/types";
import styles from "./ServiceBookingPageContent.module.css";

import type { ReactElement } from "react";

function formatPriceUnit(unit: string): string {
  if (unit === "hour") {
    return "за час";
  }

  if (unit === "day") {
    return "за день";
  }

  if (unit === "service") {
    return "за услугу";
  }

  if (unit === "walk") {
    return "за прогулку";
  }

  if (unit === "visit") {
    return "за визит";
  }

  return unit;
}

function formatPrice(value: number, currency: "RUB"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  if (!value) {
    return "—";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatModeLabel(mode: string): string {
  if (mode === "fixed_slot") {
    return "Фиксированный слот";
  }

  if (mode === "time_range") {
    return "Произвольный интервал";
  }

  if (mode === "multi_day_stay") {
    return "Передержка на несколько дней";
  }

  if (mode === "open_request") {
    return "Свободный запрос";
  }

  return mode;
}

function buildSummaryDateLabel(): string {
  const mode = serviceBookingStore.bookingMode;

  if (mode === "fixed_slot") {
    return serviceBookingStore.draft.selectedDate
      ? formatDate(serviceBookingStore.draft.selectedDate)
      : "—";
  }

  if (mode === "time_range") {
    if (
      !serviceBookingStore.draft.requestedStartDate ||
      !serviceBookingStore.draft.requestedEndDate
    ) {
      return "—";
    }

    if (
      serviceBookingStore.draft.requestedStartDate ===
      serviceBookingStore.draft.requestedEndDate
    ) {
      return formatDate(serviceBookingStore.draft.requestedStartDate);
    }

    return `${formatDate(
      serviceBookingStore.draft.requestedStartDate
    )} — ${formatDate(serviceBookingStore.draft.requestedEndDate)}`;
  }

  if (mode === "multi_day_stay") {
    if (
      !serviceBookingStore.draft.stayCheckInDate ||
      !serviceBookingStore.draft.stayCheckOutDate
    ) {
      return "—";
    }

    return `${formatDate(
      serviceBookingStore.draft.stayCheckInDate
    )} — ${formatDate(serviceBookingStore.draft.stayCheckOutDate)}`;
  }

  if (serviceBookingStore.draft.requestedStartDate) {
    return formatDate(serviceBookingStore.draft.requestedStartDate);
  }

  return "По согласованию";
}

function buildSummaryTimeLabel(): string {
  const mode = serviceBookingStore.bookingMode;
  const selectedSlot = serviceBookingStore.selectedSlot;

  if (mode === "fixed_slot") {
    return selectedSlot
      ? `${selectedSlot.startTime} – ${selectedSlot.endTime}`
      : "Не выбрано";
  }

  if (mode === "time_range") {
    const {
      requestedStartTime,
      requestedEndTime,
      requestedStartDate,
      requestedEndDate,
    } = serviceBookingStore.draft;

    if (
      !requestedStartDate ||
      !requestedStartTime ||
      !requestedEndDate ||
      !requestedEndTime
    ) {
      return "Не выбрано";
    }

    return `${requestedStartTime} – ${requestedEndTime}`;
  }

  if (mode === "multi_day_stay") {
    const {
      stayCheckInTime,
      stayCheckOutTime,
      stayCheckInDate,
      stayCheckOutDate,
    } = serviceBookingStore.draft;

    if (
      !stayCheckInDate ||
      !stayCheckInTime ||
      !stayCheckOutDate ||
      !stayCheckOutTime
    ) {
      return "Не выбрано";
    }

    return `Заезд ${stayCheckInTime}, выезд ${stayCheckOutTime}`;
  }

  const startTime = serviceBookingStore.draft.requestedStartTime;
  const endTime = serviceBookingStore.draft.requestedEndTime;

  if (!startTime && !endTime) {
    return "По согласованию";
  }

  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }

  return startTime || endTime || "По согласованию";
}

function buildSummaryExtraLabel(): string | null {
  if (serviceBookingStore.bookingMode !== "multi_day_stay") {
    return null;
  }

  const stayDays = serviceBookingStore.stayDays;

  if (!stayDays) {
    return null;
  }

  return `${stayDays} дн.`;
}

function canSubmitBooking(): boolean {
  const selectedService = serviceBookingStore.selectedService;
  const selectedPet = serviceBookingStore.selectedPet;
  const mode = serviceBookingStore.bookingMode;

  if (!selectedService || !selectedPet) {
    return false;
  }

  if (mode === "fixed_slot") {
    return Boolean(serviceBookingStore.selectedSlot);
  }

  if (mode === "time_range") {
    return Boolean(
      serviceBookingStore.draft.requestedStartDate &&
        serviceBookingStore.draft.requestedStartTime &&
        serviceBookingStore.draft.requestedEndDate &&
        serviceBookingStore.draft.requestedEndTime
    );
  }

  if (mode === "multi_day_stay") {
    return Boolean(
      serviceBookingStore.draft.stayCheckInDate &&
        serviceBookingStore.draft.stayCheckInTime &&
        serviceBookingStore.draft.stayCheckOutDate &&
        serviceBookingStore.draft.stayCheckOutTime
    );
  }

  return true;
}

export const ServiceBookingPageContent = observer((): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const state = (location.state as ServiceBookingLocationState | null) ?? null;
  const repeatOrderId = searchParams.get("repeat");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    void serviceBookingStore.load({
      specialistSlug: state?.specialistSlug,
      presetServiceId: state?.serviceId ?? null,
      repeatOrderId,
    });

    return () => {
      serviceBookingStore.submitError = null;
    };
  }, [repeatOrderId, state?.serviceId, state?.specialistSlug]);

  const specialist = serviceBookingStore.specialist;
  const services = serviceBookingStore.services;
  const pets = serviceBookingStore.pets;
  const selectedService = serviceBookingStore.selectedService;
  const availableDates = serviceBookingStore.availableDates;
  const availableSlots = serviceBookingStore.availableSlotsForSelectedDate;
  const bookingMode = serviceBookingStore.bookingMode;
  const estimatedPrice = serviceBookingStore.estimatedPrice;

  const handleSubmit = async (): Promise<void> => {
    try {
      const createdOrder = await serviceBookingStore.submit();

      if (!createdOrder) {
        return;
      }

      navigate("/profile", {
        state: {
          activeTab: "orders",
          highlightedOrderId: createdOrder.id,
          justCreatedOrderId: createdOrder.id,
        },
      });
    } catch {
      // ошибка уже положена в store
    }
  };

  if (serviceBookingStore.loading) {
    return (
      <section className={styles.page}>
        <div className={styles.card}>Подготавливаем оформление заказа...</div>
      </section>
    );
  }

  if (serviceBookingStore.error) {
    return (
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.error}>{serviceBookingStore.error}</div>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              navigate(-1);
            }}
          >
            Назад
          </button>
        </div>
      </section>
    );
  }

  if (!specialist) {
    return (
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.error}>Не удалось определить специалиста.</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Оформление заказа</h1>
              <p className={styles.subtitle}>
                Специалист:{" "}
                {`${specialist.main.firstName} ${specialist.main.lastName}`.trim()}
              </p>
              <p className={styles.helperText}>
                Формат бронирования зависит от выбранной услуги.
              </p>
              {serviceBookingStore.sourceOrderId ? (
                <p className={styles.helperText}>
                  Вы оформляете повторный заказ на основе предыдущего.
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                navigate(`/specialists/${specialist.slug}`);
              }}
            >
              Вернуться в профиль
            </button>
          </div>

          {serviceBookingStore.submitError ? (
            <div className={styles.error}>
              {serviceBookingStore.submitError}
            </div>
          ) : null}

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Услуга</span>
              <select
                className={styles.control}
                value={serviceBookingStore.draft.serviceId}
                onChange={(event) => {
                  serviceBookingStore.setServiceId(event.target.value);
                }}
              >
                <option value="">Выберите услугу</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {formatPrice(service.price, "RUB")}{" "}
                    {formatPriceUnit(service.priceUnit)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Питомец</span>
              <select
                className={styles.control}
                value={serviceBookingStore.draft.petId}
                onChange={(event) => {
                  serviceBookingStore.setPetId(event.target.value);
                }}
                disabled={pets.length === 0}
              >
                <option value="">
                  {pets.length === 0
                    ? "Сначала добавьте питомца"
                    : "Выберите питомца"}
                </option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.fieldWide}>
              <div className={styles.modeBadge}>
                {selectedService ? (
                  <>
                    <span className={styles.modeBadgeLabel}>
                      Режим бронирования
                    </span>
                    <span className={styles.modeBadgeValue}>
                      {formatModeLabel(bookingMode)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={styles.modeBadgeLabel}>
                      Режим бронирования
                    </span>
                    <span className={styles.modeBadgeValue}>
                      Сначала выберите услугу
                    </span>
                  </>
                )}
              </div>
            </div>

            {bookingMode === "fixed_slot" ? (
              <>
                <label className={styles.field}>
                  <span className={styles.label}>Дата</span>
                  <select
                    className={styles.control}
                    value={serviceBookingStore.draft.selectedDate}
                    onChange={(event) => {
                      serviceBookingStore.setSelectedDate(event.target.value);
                    }}
                    disabled={availableDates.length === 0}
                  >
                    <option value="">
                      {availableDates.length === 0
                        ? "Нет доступных дат"
                        : "Выберите дату"}
                    </option>
                    {availableDates.map((dateItem) => (
                      <option key={dateItem.date} value={dateItem.date}>
                        {dateItem.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.fieldWide}>
                  <span className={styles.label}>Доступные слоты</span>

                  {availableDates.length === 0 ? (
                    <div className={styles.emptyState}>
                      У выбранного специалиста пока нет доступных слотов для
                      этой услуги.
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className={styles.emptyState}>
                      На выбранную дату нет доступных слотов для этой услуги.
                    </div>
                  ) : (
                    <div className={styles.slotsGrid}>
                      {availableSlots.map((slot) => {
                        const isSelected =
                          slot.id === serviceBookingStore.draft.selectedSlotId;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            className={
                              isSelected
                                ? styles.slotButtonActive
                                : styles.slotButton
                            }
                            onClick={() => {
                              serviceBookingStore.setSelectedSlotId(slot.id);
                            }}
                          >
                            {slot.startTime} – {slot.endTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {bookingMode === "time_range" ? (
              <div className={styles.fieldWide}>
                <span className={styles.label}>Интервал времени</span>
                <div className={styles.rangeGrid}>
                  <label className={styles.field}>
                    <span className={styles.subLabel}>Дата начала</span>
                    <input
                      className={styles.control}
                      type="date"
                      value={serviceBookingStore.draft.requestedStartDate}
                      onChange={(event) => {
                        serviceBookingStore.setRequestedRange({
                          startDate: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>Время начала</span>
                    <input
                      className={styles.control}
                      type="time"
                      step={1800}
                      value={serviceBookingStore.draft.requestedStartTime}
                      onChange={(event) => {
                        serviceBookingStore.setRequestedRange({
                          startTime: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>Дата окончания</span>
                    <input
                      className={styles.control}
                      type="date"
                      value={serviceBookingStore.draft.requestedEndDate}
                      onChange={(event) => {
                        serviceBookingStore.setRequestedRange({
                          endDate: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>Время окончания</span>
                    <input
                      className={styles.control}
                      type="time"
                      step={1800}
                      value={serviceBookingStore.draft.requestedEndTime}
                      onChange={(event) => {
                        serviceBookingStore.setRequestedRange({
                          endTime: event.target.value,
                        });
                      }}
                    />
                  </label>
                </div>

                <div className={styles.infoBox}>
                  Для этой услуги можно запросить произвольный интервал внутри
                  доступного окна специалиста. Проверка пересечений и
                  ограничений выполняется при создании заказа.
                </div>
              </div>
            ) : null}

            {bookingMode === "multi_day_stay" ? (
              <div className={styles.fieldWide}>
                <span className={styles.label}>Параметры передержки</span>
                <div className={styles.rangeGrid}>
                  <label className={styles.field}>
                    <span className={styles.subLabel}>Дата заезда</span>
                    <input
                      className={styles.control}
                      type="date"
                      value={serviceBookingStore.draft.stayCheckInDate}
                      onChange={(event) => {
                        serviceBookingStore.setStayRange({
                          checkInDate: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>Время заезда</span>
                    <input
                      className={styles.control}
                      type="time"
                      step={1800}
                      value={serviceBookingStore.draft.stayCheckInTime}
                      onChange={(event) => {
                        serviceBookingStore.setStayRange({
                          checkInTime: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>Дата выезда</span>
                    <input
                      className={styles.control}
                      type="date"
                      value={serviceBookingStore.draft.stayCheckOutDate}
                      onChange={(event) => {
                        serviceBookingStore.setStayRange({
                          checkOutDate: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>Время выезда</span>
                    <input
                      className={styles.control}
                      type="time"
                      step={1800}
                      value={serviceBookingStore.draft.stayCheckOutTime}
                      onChange={(event) => {
                        serviceBookingStore.setStayRange({
                          checkOutTime: event.target.value,
                        });
                      }}
                    />
                  </label>
                </div>

                <div className={styles.infoBox}>
                  Длительность передержки: {serviceBookingStore.stayDays || 0}{" "}
                  дн.
                </div>
              </div>
            ) : null}

            {bookingMode === "open_request" ? (
              <div className={styles.fieldWide}>
                <span className={styles.label}>Предпочтительное время</span>
                <div className={styles.rangeGrid}>
                  <label className={styles.field}>
                    <span className={styles.subLabel}>
                      Предпочтительная дата
                    </span>
                    <input
                      className={styles.control}
                      type="date"
                      value={serviceBookingStore.draft.requestedStartDate}
                      onChange={(event) => {
                        serviceBookingStore.setRequestedRange({
                          startDate: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>
                      Удобное время начала
                    </span>
                    <input
                      className={styles.control}
                      type="time"
                      step={1800}
                      value={serviceBookingStore.draft.requestedStartTime}
                      onChange={(event) => {
                        serviceBookingStore.setRequestedRange({
                          startTime: event.target.value,
                        });
                      }}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.subLabel}>
                      Удобное время окончания
                    </span>
                    <input
                      className={styles.control}
                      type="time"
                      step={1800}
                      value={serviceBookingStore.draft.requestedEndTime}
                      onChange={(event) => {
                        serviceBookingStore.setRequestedRange({
                          endTime: event.target.value,
                        });
                      }}
                    />
                  </label>
                </div>

                <div className={styles.infoBox}>
                  Специалист согласует точное время после получения запроса.
                </div>
              </div>
            ) : null}

            <label className={styles.fieldWide}>
              <span className={styles.label}>Комментарий</span>
              <textarea
                className={styles.textarea}
                rows={5}
                value={serviceBookingStore.draft.comment}
                onChange={(event) => {
                  serviceBookingStore.setComment(event.target.value);
                }}
                placeholder="Например: питомец боится громких звуков, важно гулять на поводке, дома есть домофон..."
              />
            </label>
          </div>

          {pets.length === 0 ? (
            <div className={styles.emptyPets}>
              <p className={styles.emptyPetsText}>
                Чтобы оформить услугу, сначала добавьте хотя бы одного питомца в
                профиль.
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  navigate("/profile");
                }}
              >
                Перейти в профиль
              </button>
            </div>
          ) : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                navigate("/profile");
              }}
            >
              Отмена
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              disabled={
                serviceBookingStore.submitting ||
                pets.length === 0 ||
                !canSubmitBooking()
              }
              onClick={() => {
                void handleSubmit();
              }}
            >
              {serviceBookingStore.submitting ? "Создание..." : "Создать заказ"}
            </button>
          </div>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.sideTitle}>Сводка</h2>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Специалист</span>

            <button
              type="button"
              className={styles.inlineLinkButton}
              onClick={() => {
                navigate(`/specialists/${specialist.slug}`, {
                  state: {
                    from: `${location.pathname}${location.search}`,
                  },
                });
              }}
            >
              {`${specialist.main.firstName} ${specialist.main.lastName}`.trim()}
            </button>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Город</span>
            <span className={styles.summaryValue}>{specialist.main.city}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Услуга</span>
            <span className={styles.summaryValue}>
              {selectedService?.name ?? "Не выбрана"}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Режим</span>
            <span className={styles.summaryValue}>
              {formatModeLabel(bookingMode)}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Формат</span>
            <span className={styles.summaryValue}>
              {selectedService?.locationLabel ?? "—"}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Дата</span>
            <span className={styles.summaryValue}>
              {buildSummaryDateLabel()}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Время</span>
            <span className={styles.summaryValue}>
              {buildSummaryTimeLabel()}
            </span>
          </div>

          {buildSummaryExtraLabel() ? (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Длительность</span>
              <span className={styles.summaryValue}>
                {buildSummaryExtraLabel()}
              </span>
            </div>
          ) : null}

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Стоимость</span>
            <span className={styles.summaryValue}>
              {selectedService && estimatedPrice !== null
                ? `${formatPrice(estimatedPrice, "RUB")} ${formatPriceUnit(
                    selectedService.priceUnit
                  )}`
                : "—"}
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
});
