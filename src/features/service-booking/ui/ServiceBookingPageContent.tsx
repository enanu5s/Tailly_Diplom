// src/features/service-booking/ui/ServiceBookingPageContent.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { serviceBookingStore } from '../model/serviceBookingStore';
import type { ServiceBookingLocationState } from '../model/types';
import styles from './ServiceBookingPageContent.module.css';

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

export const ServiceBookingPageContent = observer((): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

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
  const selectedSlot = serviceBookingStore.selectedSlot;
  const availableDates = serviceBookingStore.availableDates;
  const availableSlots = serviceBookingStore.availableSlotsForSelectedDate;

  const handleSubmit = async (): Promise<void> => {
    try {
      await serviceBookingStore.submit();
      navigate('/profile');
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
                Специалист:{' '}
                {`${specialist.main.firstName} ${specialist.main.lastName}`.trim()}
              </p>
              <p className={styles.helperText}>
                Дата и время выбираются из доступного расписания специалиста.
              </p>
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
            <div className={styles.error}>{serviceBookingStore.submitError}</div>
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
                    {service.name} — {formatPrice(service.price, 'RUB')}{' '}
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
                  {pets.length === 0 ? 'Сначала добавьте питомца' : 'Выберите питомца'}
                </option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </label>

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
                    ? 'Нет доступных дат'
                    : 'Выберите дату'}
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
                  У выбранного специалиста пока нет доступных слотов для онлайн-бронирования.
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
                          isSelected ? styles.slotButtonActive : styles.slotButton
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

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                navigate('/profile');
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
                !selectedSlot
              }
              onClick={() => {
                void handleSubmit();
              }}
            >
              {serviceBookingStore.submitting ? 'Создание...' : 'Создать заказ'}
            </button>
          </div>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.sideTitle}>Сводка</h2>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Специалист</span>
            <span className={styles.summaryValue}>
              {`${specialist.main.firstName} ${specialist.main.lastName}`.trim()}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Город</span>
            <span className={styles.summaryValue}>{specialist.main.city}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Услуга</span>
            <span className={styles.summaryValue}>
              {selectedService?.name ?? 'Не выбрана'}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Формат</span>
            <span className={styles.summaryValue}>
              {selectedService?.locationLabel ?? '—'}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Дата</span>
            <span className={styles.summaryValue}>
              {serviceBookingStore.draft.selectedDate
                ? new Date(
                    `${serviceBookingStore.draft.selectedDate}T00:00:00`,
                  ).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Время</span>
            <span className={styles.summaryValue}>
              {selectedSlot
                ? `${selectedSlot.startTime} – ${selectedSlot.endTime}`
                : 'Не выбрано'}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Стоимость</span>
            <span className={styles.summaryValue}>
              {selectedService
                ? `${formatPrice(selectedService.price, 'RUB')} ${formatPriceUnit(
                    selectedService.priceUnit,
                  )}`
                : '—'}
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
});