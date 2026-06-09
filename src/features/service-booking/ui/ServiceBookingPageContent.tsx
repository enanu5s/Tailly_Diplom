// src/features/service-booking/ui/ServiceBookingPageContent.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { ServiceBookingCalendar } from './ServiceBookingCalendar';
import styles from './ServiceBookingPageContent.module.css';
import { serviceBookingStore } from '../model/serviceBookingStore';

import type { ServiceBookingLocationState } from '../model/types';
import type { ReactElement } from 'react';

function formatPriceUnit(unit: string): string {
  if (unit === 'hour') {
    return 'за час';
  }

  if (unit === 'day') {
    return 'за день';
  }

  if (unit === 'service') {
    return 'за услугу';
  }

  if (unit === 'walk') {
    return 'за прогулку';
  }

  if (unit === 'visit') {
    return 'за визит';
  }

  return unit;
}

function formatPrice(value: number, currency: 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortBookingDate(value: string): string {
  if (!value) {
    return '—';
  }

  return new Date(`${value}T12:00:00`).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

function formatModeLabel(mode: string): string {
  if (mode === 'fixed_slot') {
    return 'Фиксированный слот';
  }

  if (mode === 'time_range') {
    return 'Произвольный интервал';
  }

  if (mode === 'multi_day_stay') {
    return 'Передержка на несколько дней';
  }

  if (mode === 'open_request') {
    return 'Свободный запрос';
  }

  return mode;
}

function canSubmitBooking(): boolean {
  const selectedService = serviceBookingStore.selectedService;
  const selectedPet = serviceBookingStore.selectedPet;
  const mode = serviceBookingStore.bookingMode;

  if (!selectedService || !selectedPet) {
    return false;
  }

  if (mode === 'fixed_slot') {
    return Boolean(serviceBookingStore.selectedSlot);
  }

  if (mode === 'time_range') {
    if (serviceBookingStore.availableDates.length === 0) {
      return false;
    }

    return Boolean(
      serviceBookingStore.draft.requestedStartDate &&
        serviceBookingStore.draft.requestedStartTime &&
        serviceBookingStore.draft.requestedEndDate &&
        serviceBookingStore.draft.requestedEndTime,
    );
  }

  if (mode === 'multi_day_stay') {
    if (serviceBookingStore.availableDates.length === 0) {
      return false;
    }

    return Boolean(
      serviceBookingStore.draft.stayCheckInDate &&
        serviceBookingStore.draft.stayCheckInTime &&
        serviceBookingStore.draft.stayCheckOutDate &&
        serviceBookingStore.draft.stayCheckOutTime,
    );
  }

  if (mode === 'open_request') {
    if (serviceBookingStore.availableDates.length === 0) {
      return false;
    }

    return Boolean(serviceBookingStore.draft.requestedStartDate);
  }

  return true;
}

function CalendarIcon(): ReactElement {
  return (
    <svg className={styles.calendarGlyph} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
      />
    </svg>
  );
}

export const ServiceBookingPageContent = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const state = (location.state as ServiceBookingLocationState | null) ?? null;
  const repeatOrderId = searchParams.get('repeat');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

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
  const stayCheckoutDates = serviceBookingStore.stayCheckoutDateOptions;
  const availableSlots = serviceBookingStore.availableSlotsForSelectedDate;
  const bookingMode = serviceBookingStore.bookingMode;
  const estimatedPrice = serviceBookingStore.estimatedPrice;
  const draft = serviceBookingStore.draft;

  const handleSubmit = async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      const createdOrder = await serviceBookingStore.submit({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
      });

      if (!createdOrder) {
        return;
      }

      navigate('/profile', {
        state: {
          activeTab: 'orders',
          highlightedOrderId: createdOrder.id,
          justCreatedOrderId: createdOrder.id,
        },
      });
    } catch {
      // ошибка уже положена в store
    }
  };

  const handleCalendarDay = (iso: string): void => {
    if (!availableDates.some((item) => item.date === iso)) {
      return;
    }

    if (bookingMode === 'fixed_slot') {
      serviceBookingStore.setSelectedDate(iso);
      return;
    }

    if (bookingMode === 'time_range' || bookingMode === 'open_request') {
      serviceBookingStore.setRequestedRange({ startDate: iso });
      return;
    }

    if (bookingMode === 'multi_day_stay') {
      const inD = draft.stayCheckInDate.trim();

      if (!inD || iso < inD) {
        serviceBookingStore.setStayRange({ checkInDate: iso, checkOutDate: iso });
        return;
      }

      serviceBookingStore.setStayRange({ checkOutDate: iso });
    }
  };

  const calendarAnchorIso =
    bookingMode === 'fixed_slot'
      ? draft.selectedDate
      : bookingMode === 'multi_day_stay'
        ? draft.stayCheckInDate || draft.stayCheckOutDate
        : draft.requestedStartDate;

  const calendarPrimaryIso =
    bookingMode === 'fixed_slot'
      ? draft.selectedDate
      : bookingMode === 'multi_day_stay'
        ? draft.stayCheckInDate
        : draft.requestedStartDate;

  const calendarSecondaryIso = bookingMode === 'multi_day_stay' ? draft.stayCheckOutDate : '';

  if (serviceBookingStore.loading) {
    return (
      <section className={styles.page}>
        <div className={styles.loadingCard}>Подготавливаем оформление заказа...</div>
      </section>
    );
  }

  if (serviceBookingStore.error) {
    return (
      <section className={styles.page}>
        <div className={styles.errorCard}>
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
        <div className={styles.errorCard}>
          <div className={styles.error}>Не удалось определить специалиста.</div>
        </div>
      </section>
    );
  }

  const specialistName = `${specialist.main.firstName} ${specialist.main.lastName}`.trim();

  const totalLabel =
    selectedService && estimatedPrice !== null
      ? `Итоговая сумма: ${formatPrice(estimatedPrice, 'RUB')}`
      : 'Итоговая сумма: —';

  return (
    <section className={styles.page}>
      <div className={styles.pageInner}>
        <div className={styles.backRow}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => {
              navigate(`/specialists/${specialist.slug}`);
            }}
          >
            <span className={styles.backIcon} aria-hidden>
              ←
            </span>
            Назад
          </button>
        </div>

        <h1 className={styles.pageTitle}>Оформление заказа</h1>

        <div className={styles.twoColumns}>
          <aside className={styles.calendarCard}>
            <h2 className={styles.cardTitle}>Календарь</h2>
            <ServiceBookingCalendar
              availableDates={availableDates}
              bookingMode={bookingMode}
              anchorIso={calendarAnchorIso}
              selectedPrimaryIso={calendarPrimaryIso}
              selectedSecondaryIso={calendarSecondaryIso}
              onSelectDay={handleCalendarDay}
            />
          </aside>

          <div className={styles.formCard}>
            <h2 className={styles.specialistHeading}>Специалист: {specialistName}</h2>

            {serviceBookingStore.sourceOrderId ? (
              <p className={styles.repeatNote}>
                Вы оформляете повторный заказ на основе предыдущего.
              </p>
            ) : null}

            {serviceBookingStore.submitError ? (
              <div className={styles.error}>{serviceBookingStore.submitError}</div>
            ) : null}

            <div className={styles.formBody}>
              {bookingMode === 'fixed_slot' ? (
                <div className={styles.row3}>
                  <label className={styles.field}>
                    <span className={styles.label}>Услуга</span>
                    <select
                      className={`${styles.control} ${styles.controlService}`}
                      value={draft.serviceId}
                      onChange={(event) => {
                        serviceBookingStore.setServiceId(event.target.value);
                      }}
                    >
                      <option value="">Выберите услугу</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} — {formatPrice(service.price, 'RUB')}{' '}
                          {formatPriceUnit(service.priceUnit)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className={styles.field}>
                    <span className={styles.label}>Выберите дату</span>
                    <div className={styles.controlWrap}>
                      <div
                        className={`${styles.dateLike} ${
                          !draft.selectedDate ? styles.dateLikeMuted : ''
                        }`}
                      >
                        <span>
                          {draft.selectedDate
                            ? formatShortBookingDate(draft.selectedDate)
                            : 'Выберите дату'}
                        </span>
                        <CalendarIcon />
                      </div>
                    </div>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.label}>Питомец</span>
                    <select
                      className={styles.control}
                      value={draft.petId}
                      onChange={(event) => {
                        serviceBookingStore.setPetId(event.target.value);
                      }}
                      disabled={pets.length === 0}
                    >
                      <option value="">
                        {pets.length === 0 ? 'Сначала добавьте питомца' : 'Выберите питомца'}
                      </option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <>
                  <div className={styles.row2wide}>
                    <label className={styles.field}>
                      <span className={styles.label}>Услуга</span>
                      <select
                        className={`${styles.control} ${styles.controlService}`}
                        value={draft.serviceId}
                        onChange={(event) => {
                          serviceBookingStore.setServiceId(event.target.value);
                        }}
                      >
                        <option value="">Выберите услугу</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} — {formatPrice(service.price, 'RUB')}{' '}
                            {formatPriceUnit(service.priceUnit)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {bookingMode === 'multi_day_stay' ? (
                    <div className={styles.row2dates}>
                      <label className={styles.field}>
                        <span className={styles.label}>Дата заезда</span>
                        <select
                          className={styles.control}
                          value={draft.stayCheckInDate}
                          onChange={(event) => {
                            serviceBookingStore.setStayRange({
                              checkInDate: event.target.value,
                            });
                          }}
                        >
                          <option value="">Выберите дату</option>
                          {availableDates.map((dateItem) => (
                            <option key={dateItem.date} value={dateItem.date}>
                              {dateItem.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className={styles.field}>
                        <span className={styles.label}>Дата выезда</span>
                        <select
                          className={styles.control}
                          value={draft.stayCheckOutDate}
                          onChange={(event) => {
                            serviceBookingStore.setStayRange({
                              checkOutDate: event.target.value,
                            });
                          }}
                          disabled={!draft.stayCheckInDate}
                        >
                          <option value="">Выберите дату</option>
                          {stayCheckoutDates.map((dateItem) => (
                            <option key={dateItem.date} value={dateItem.date}>
                              {dateItem.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}

                  {bookingMode === 'time_range' || bookingMode === 'open_request' ? (
                    <div className={styles.field}>
                      <span className={styles.label}>Дата</span>
                      <div className={styles.controlWrap}>
                        <div
                          className={`${styles.dateLike} ${
                            !draft.requestedStartDate ? styles.dateLikeMuted : ''
                          }`}
                        >
                          <span>
                            {draft.requestedStartDate
                              ? formatShortBookingDate(draft.requestedStartDate)
                              : 'Выберите дату'}
                          </span>
                          <CalendarIcon />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {bookingMode === 'multi_day_stay' ? (
                    <>
                      <div className={styles.row2wide}>
                        <label className={styles.field}>
                          <span className={styles.label}>Где проходит?</span>
                          <div className={styles.locationReadonly}>
                            {selectedService?.locationLabel ?? '—'}
                          </div>
                        </label>

                        <label className={styles.field}>
                          <span className={styles.label}>Питомец</span>
                          <select
                            className={styles.control}
                            value={draft.petId}
                            onChange={(event) => {
                              serviceBookingStore.setPetId(event.target.value);
                            }}
                            disabled={pets.length === 0}
                          >
                            <option value="">
                              {pets.length === 0
                                ? 'Сначала добавьте питомца'
                                : 'Выберите питомца'}
                            </option>
                            {pets.map((pet) => (
                              <option key={pet.id} value={pet.id}>
                                {pet.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className={styles.row2wide}>
                        <label className={styles.field}>
                          <span className={styles.label}>Время заезда</span>
                          <input
                            className={styles.control}
                            type="time"
                            step={1800}
                            value={draft.stayCheckInTime}
                            onChange={(event) => {
                              serviceBookingStore.setStayRange({
                                checkInTime: event.target.value,
                              });
                            }}
                          />
                        </label>

                        <label className={styles.field}>
                          <span className={styles.label}>Время выезда</span>
                          <input
                            className={styles.control}
                            type="time"
                            step={1800}
                            value={draft.stayCheckOutTime}
                            onChange={(event) => {
                              serviceBookingStore.setStayRange({
                                checkOutTime: event.target.value,
                              });
                            }}
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className={styles.field}>
                      <span className={styles.label}>Питомец</span>
                      <select
                        className={styles.control}
                        value={draft.petId}
                        onChange={(event) => {
                          serviceBookingStore.setPetId(event.target.value);
                        }}
                        disabled={pets.length === 0}
                      >
                        <option value="">
                          {pets.length === 0 ? 'Сначала добавьте питомца' : 'Выберите питомца'}
                        </option>
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              )}

              {bookingMode === 'fixed_slot' ? (
                <div className={styles.slotsSection}>
                  <span className={styles.label}>Выберите время</span>
                  {availableDates.length === 0 ? (
                    <div className={styles.emptyState}>
                      У выбранного специалиста пока нет доступных слотов для этой услуги.
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className={styles.emptyState}>
                      На выбранную дату нет доступных слотов для этой услуги.
                    </div>
                  ) : (
                    <div className={styles.slotsGrid}>
                      {availableSlots.map((slot) => {
                        const isSelected = slot.id === draft.selectedSlotId;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            className={isSelected ? styles.slotButtonActive : styles.slotButton}
                            onClick={() => {
                              serviceBookingStore.setSelectedSlotId(slot.id);
                            }}
                          >
                            {slot.startTime} — {slot.endTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {bookingMode === 'time_range' ? (
                <div className={styles.fieldWide}>
                  {availableDates.length === 0 ? (
                    <div className={styles.emptyState}>
                      У выбранного специалиста нет свободных дат для этой услуги в календаре.
                    </div>
                  ) : (
                    <>
                      <div className={styles.rangeGrid3}>
                        <label className={styles.field}>
                          <span className={styles.subLabel}>Время начала</span>
                          <input
                            className={styles.control}
                            type="time"
                            step={1800}
                            value={draft.requestedStartTime}
                            onChange={(event) => {
                              serviceBookingStore.setRequestedRange({
                                startTime: event.target.value,
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
                            value={draft.requestedEndTime}
                            onChange={(event) => {
                              serviceBookingStore.setRequestedRange({
                                endTime: event.target.value,
                              });
                            }}
                          />
                        </label>
                      </div>

                      <div className={styles.infoBox}>
                        Режим: {formatModeLabel(bookingMode)}. Доступны только дни из календаря
                        специалиста; начало и конец — в пределах выбранного дня.
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {bookingMode === 'open_request' ? (
                <div className={styles.fieldWide}>
                  {availableDates.length === 0 ? (
                    <div className={styles.emptyState}>
                      У выбранного специалиста нет свободных дат для этой услуги в календаре.
                    </div>
                  ) : (
                    <>
                      <div className={styles.rangeGrid3}>
                        <label className={styles.field}>
                          <span className={styles.subLabel}>Удобное время начала</span>
                          <input
                            className={styles.control}
                            type="time"
                            step={1800}
                            value={draft.requestedStartTime}
                            onChange={(event) => {
                              serviceBookingStore.setRequestedRange({
                                startTime: event.target.value,
                              });
                            }}
                          />
                        </label>

                        <label className={styles.field}>
                          <span className={styles.subLabel}>Удобное время окончания</span>
                          <input
                            className={styles.control}
                            type="time"
                            step={1800}
                            value={draft.requestedEndTime}
                            onChange={(event) => {
                              serviceBookingStore.setRequestedRange({
                                endTime: event.target.value,
                              });
                            }}
                          />
                        </label>
                      </div>

                      <div className={styles.infoBox}>
                        Режим: {formatModeLabel(bookingMode)}. Точное время согласуется после
                        запроса.
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              <label className={styles.fieldWide}>
                <span className={styles.label}>Комментарий</span>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={draft.comment}
                  onChange={(event) => {
                    serviceBookingStore.setComment(event.target.value);
                  }}
                  placeholder="Например: Питомец боится громких звуков, важно гулять на поводке, дома есть домофон..."
                />
              </label>
            </div>

            {pets.length === 0 ? (
              <div className={styles.emptyPets}>
                <p className={styles.emptyPetsText}>
                  Чтобы оформить услугу, сначала добавьте хотя бы одного питомца в профиль.
                </p>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    navigate('/profile');
                  }}
                >
                  Перейти в профиль
                </button>
              </div>
            ) : null}

            <div className={styles.footer}>
              <p className={styles.total}>{totalLabel}</p>

              <div className={styles.cancelBtn}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    navigate(`/specialists/${specialist.slug}`);
                  }}
                >
                  Отмена
                </button>
              </div>

              <div className={styles.submitBtn}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={
                    serviceBookingStore.submitting ||
                    pets.length === 0 ||
                    !user?.id ||
                    !canSubmitBooking()
                  }
                  onClick={() => {
                    void handleSubmit();
                  }}
                >
                  {serviceBookingStore.submitting ? 'Создание...' : 'Создать заказ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
