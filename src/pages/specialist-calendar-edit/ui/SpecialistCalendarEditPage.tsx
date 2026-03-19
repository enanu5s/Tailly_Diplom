// src/pages/specialist-calendar-edit/ui/SpecialistCalendarEditPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
  buildCalendarMonthDays,
  CALENDAR_STATUS_LABELS,
  CALENDAR_WEEKDAY_LABELS,
  formatMonthLabel,
  getDateBookingSummary,
} from '@/features/specialist-profile/model/calendarUtils';
import { SpecialistCalendarEditStore } from '@/features/specialist-profile/model/specialistCalendarEditStore';

import styles from './SpecialistCalendarEditPage.module.css';

export const SpecialistCalendarEditPage = observer(() => {
  const { specialistSlug } = useParams<{ specialistSlug: string }>();
  const { isAuth, user } = useAuth();

  const store = useMemo(() => new SpecialistCalendarEditStore(), []);

  useEffect(() => {
    if (!specialistSlug) {
      return;
    }

    void store.load(specialistSlug);
  }, [
    specialistSlug,
    store,
    isAuth,
    user?.id,
    user?.role,
    user?.specialistSlug,
    user?.specialistId,
  ]);

  useEffect(() => {
    return () => {
      store.reset();
    };
  }, [store]);

  if (!specialistSlug) {
    return <Navigate to="/" replace />;
  }

  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'specialist') {
    return <Navigate to={`/specialists/${specialistSlug}`} replace />;
  }

  if (
    user.specialistSlug &&
    user.specialistSlug !== specialistSlug &&
    store.profile?.id !== user.specialistId
  ) {
    return <Navigate to={`/specialists/${specialistSlug}`} replace />;
  }

  if (store.profile && !store.profile.isOwner) {
    return <Navigate to={`/specialists/${specialistSlug}`} replace />;
  }

  if (store.isLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateCard}>
            <h1 className={styles.stateTitle}>Загрузка календаря</h1>
            <p className={styles.stateText}>
              Подготавливаем настройки доступности специалиста.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (store.error || !store.profile || !store.editableCalendar) {
    return (
      <section className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateCard}>
            <h1 className={styles.stateTitle}>Не удалось открыть календарь</h1>
            <p className={styles.stateText}>
              {store.error ?? 'Профиль специалиста не найден.'}
            </p>
            <div className={styles.stateActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  void store.load(specialistSlug);
                }}
              >
                Попробовать снова
              </button>

              <Link
                to={`/specialists/${specialistSlug}`}
                className={styles.secondaryLink}
              >
                Вернуться в профиль
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const calendarMonth = buildCalendarMonthDays(
    store.currentMonth,
    store.editableCalendar,
  );

  const selectedDateSummary = getDateBookingSummary(
    store.editableCalendar,
    store.selectedDate,
  );

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Календарь специалиста</span>
            <h1 className={styles.title}>Редактирование доступности</h1>
            <p className={styles.description}>
              Сначала задай правила бронирования, а затем отмечай конкретные дни
              и окна доступности. Клиент будет видеть только эти даты и слоты.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link
              to={`/specialists/${store.profile.slug}`}
              className={styles.secondaryLink}
            >
              Назад в профиль
            </Link>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                void store.save();
              }}
              disabled={store.isSaving}
            >
              {store.isSaving ? 'Сохранение...' : 'Сохранить календарь'}
            </button>
          </div>
        </header>

        {store.hasUnsavedChanges ? (
          <div className={styles.warningBanner}>
            Есть несохранённые изменения. Они попадут в профиль после нажатия
            кнопки «Сохранить календарь».
          </div>
        ) : null}

        {store.saveError ? (
          <div className={styles.errorBanner}>{store.saveError}</div>
        ) : null}

        {store.saveSuccess ? (
          <div className={styles.successBanner}>Календарь успешно сохранён.</div>
        ) : null}

        <div className={styles.layout}>
          <div className={styles.leftColumn}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>1. Правила бронирования</h2>
              <p className={styles.panelDescription}>
                Эти настройки используются для генерации слотов, которые потом
                увидит клиент на странице оформления заказа.
              </p>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Начало рабочего дня</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={store.bookingSettings.dayStartTime}
                    onChange={(event) =>
                      store.setBookingSettingsField(
                        'dayStartTime',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Конец рабочего дня</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={store.bookingSettings.dayEndTime}
                    onChange={(event) =>
                      store.setBookingSettingsField(
                        'dayEndTime',
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Шаг слотов, минут</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={15}
                    step={15}
                    value={store.bookingSettings.slotStepMinutes}
                    onChange={(event) =>
                      store.setBookingSettingsField(
                        'slotStepMinutes',
                        Number(event.target.value),
                      )
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>
                    Длительность одного слота, минут
                  </span>
                  <input
                    className={styles.input}
                    type="number"
                    min={15}
                    step={15}
                    value={store.bookingSettings.defaultDurationMinutes}
                    onChange={(event) =>
                      store.setBookingSettingsField(
                        'defaultDurationMinutes',
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
              </div>

              {store.bookingSettingsError ? (
                <div className={styles.fieldError}>
                  {store.bookingSettingsError}
                </div>
              ) : null}

              <div className={styles.note}>
                Например, если рабочий день 10:00–19:00, шаг 30 минут, а
                длительность слота 60 минут, клиент увидит слоты вроде 10:00–
                11:00, 10:30–11:30 и так далее.
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.monthHeader}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={store.goToPreviousMonth}
                >
                  ←
                </button>

                <div className={styles.monthTitle}>
                  {formatMonthLabel(store.currentMonth)}
                </div>

                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={store.goToNextMonth}
                >
                  →
                </button>
              </div>

              <div className={styles.selectionToolbar}>
                <label className={styles.multiSelectToggle}>
                  <input
                    type="checkbox"
                    checked={store.isMultiSelectMode}
                    onChange={(event) =>
                      store.setMultiSelectMode(event.target.checked)
                    }
                  />
                  <span>Множественный выбор дат</span>
                </label>

                {store.isMultiSelectMode ? (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={store.clearSelectedDates}
                  >
                    Очистить выбор
                  </button>
                ) : null}
              </div>

              <div className={styles.weekdays}>
                {CALENDAR_WEEKDAY_LABELS.map((weekday) => (
                  <span key={weekday} className={styles.weekday}>
                    {weekday}
                  </span>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {calendarMonth.days.map((day, index) => {
                  const isSelected = day.isoDate
                    ? store.isDateSelected(day.isoDate)
                    : false;

                  return (
                    <button
                      key={day.isoDate ?? `empty-${index}`}
                      type="button"
                      className={`${styles.dayButton} ${
                        day.isoDate
                          ? styles.dayButtonActive
                          : styles.dayButtonEmpty
                      } ${isSelected ? styles.dayButtonSelected : ''} ${
                        day.status === 'day_off'
                          ? styles.dayOff
                          : day.status === 'fully_booked'
                            ? styles.fullyBooked
                            : day.status === 'partially_booked'
                              ? styles.partiallyBooked
                              : ''
                      }`}
                      disabled={!day.isoDate}
                      onClick={() => {
                        if (day.isoDate) {
                          store.selectDate(day.isoDate);
                        }
                      }}
                    >
                      {day.dayNumber ? (
                        <>
                          <span className={styles.dayNumber}>
                            {day.dayNumber}
                          </span>
                          {day.status && day.status !== 'available' ? (
                            <span className={styles.dayDot} />
                          ) : null}
                        </>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendMark} ${styles.legendFree}`} />
                  <span>{CALENDAR_STATUS_LABELS.available}</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={`${styles.legendMark} ${styles.legendPartial}`}
                  />
                  <span>{CALENDAR_STATUS_LABELS.partially_booked}</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendMark} ${styles.legendFull}`} />
                  <span>{CALENDAR_STATUS_LABELS.fully_booked}</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={`${styles.legendMark} ${styles.legendDayOff}`}
                  />
                  <span>{CALENDAR_STATUS_LABELS.day_off}</span>
                </div>
              </div>
            </div>
          </div>

          <aside className={styles.rightColumn}>
            <div className={styles.selectedDateCard}>
              <span className={styles.selectedDateCaption}>
                {store.selectedDatesCount > 1 ? 'Выбранные даты' : 'Выбранная дата'}
              </span>
              <div className={styles.selectedDateValue}>
                {store.selectedDatesLabel}
              </div>
              <div className={styles.selectedDateMeta}>
                <span className={styles.metaChip}>
                  Текущий статус активной даты:{' '}
                  {CALENDAR_STATUS_LABELS[store.selectedDateActualStatus]}
                </span>
                <span className={styles.metaChip}>
                  Активная дата: {store.selectedDate}
                </span>
              </div>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Окон доступности</span>
                  <strong className={styles.summaryValue}>
                    {selectedDateSummary.availabilityWindowsCount}
                  </strong>
                </div>

                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Booked slots</span>
                  <strong className={styles.summaryValue}>
                    {selectedDateSummary.bookedSlotsCount}
                  </strong>
                </div>

                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Доступно минут</span>
                  <strong className={styles.summaryValue}>
                    {selectedDateSummary.totalAvailabilityMinutes}
                  </strong>
                </div>

                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Занято минут</span>
                  <strong className={styles.summaryValue}>
                    {selectedDateSummary.bookedMinutes}
                  </strong>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>2. Пакетное создание окон</h2>
              <p className={styles.panelDescription}>
                Этот блок позволяет одной операцией добавить одинаковую
                доступность сразу на все выбранные даты.
              </p>

              <div className={styles.selectedDateInline}>
                Выбрано дат: <strong>{store.selectedDatesCount}</strong>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>С</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={store.bulkTemplateForm.startTime}
                    onChange={(event) =>
                      store.setBulkTemplateField('startTime', event.target.value)
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>До</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={store.bulkTemplateForm.endTime}
                    onChange={(event) =>
                      store.setBulkTemplateField('endTime', event.target.value)
                    }
                  />
                </label>
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={store.bulkTemplateForm.replaceExistingWindows}
                  onChange={(event) =>
                    store.setBulkTemplateField(
                      'replaceExistingWindows',
                      event.target.checked,
                    )
                  }
                />
                <span>Сначала очистить существующие окна у выбранных дат</span>
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Комментарий</span>
                <input
                  className={styles.input}
                  type="text"
                  value={store.bulkTemplateForm.comment}
                  onChange={(event) =>
                    store.setBulkTemplateField('comment', event.target.value)
                  }
                  placeholder="Например: вечерние окна на будние дни"
                />
              </label>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Какие услуги доступны</span>
                <div className={styles.servicesList}>
                  {store.services.map((service) => {
                    const isChecked =
                      store.bulkTemplateForm.serviceIds.includes(service.id);

                    return (
                      <label key={service.id} className={styles.checkboxCard}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            store.toggleBulkTemplateService(service.id)
                          }
                        />
                        <span>{service.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={store.resetBulkTemplateFromBookingSettings}
                >
                  Подставить время из правил бронирования
                </button>
              </div>

              {store.bulkTemplateError ? (
                <div className={styles.fieldError}>
                  {store.bulkTemplateError}
                </div>
              ) : null}

              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={store.applyBulkAvailabilityTemplate}
                >
                  Создать одинаковые окна для выбранных дат
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={store.clearAvailabilityWindowsForSelectedDates}
                >
                  Очистить окна у выбранных дат
                </button>
              </div>

              <div className={styles.note}>
                При пакетном создании ручные статусы у выбранных дат снимаются,
                чтобы эти дни можно было бронировать по созданным окнам.
              </div>

              <div className={styles.windowsList}>
                {store.selectedDatesAvailabilityWindows.length > 0 ? (
                  store.selectedDatesAvailabilityWindows.map((item) => {
                    const serviceLabels = store.services
                      .filter((service) => item.serviceIds.includes(service.id))
                      .map((service) => service.name);

                    return (
                      <div key={item.id} className={styles.windowCard}>
                        <div className={styles.windowHeader}>
                          <strong>
                            {item.date} · {item.startTime} — {item.endTime}
                          </strong>

                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => store.removeAvailabilityWindow(item.id)}
                          >
                            Удалить
                          </button>
                        </div>

                        <div className={styles.windowServices}>
                          {serviceLabels.join(', ')}
                        </div>

                        {item.comment ? (
                          <div className={styles.windowComment}>
                            {item.comment}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyState}>
                    У выбранных дат пока нет окон доступности.
                  </div>
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>3. Частичная доступность</h2>
              <p className={styles.panelDescription}>
                Этот блок всегда относится только к активной дате{' '}
                <strong>{store.selectedDateLabel}</strong>.
              </p>

              <div className={styles.selectedDateInline}>
                Настраиваемая дата: <strong>{store.selectedDate}</strong>
              </div>

              <div className={styles.note}>
                Эти окна должны попадать в рабочее время, заданное в правилах
                бронирования выше.
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>С</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={store.windowForm.startTime}
                    onChange={(event) =>
                      store.setWindowField('startTime', event.target.value)
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>До</span>
                  <input
                    className={styles.input}
                    type="time"
                    value={store.windowForm.endTime}
                    onChange={(event) =>
                      store.setWindowField('endTime', event.target.value)
                    }
                  />
                </label>
              </div>

              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={store.resetWindowFormFromBookingSettings}
                >
                  Подставить время из правил бронирования
                </button>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Комментарий</span>
                <input
                  className={styles.input}
                  type="text"
                  value={store.windowForm.comment}
                  onChange={(event) =>
                    store.setWindowField('comment', event.target.value)
                  }
                  placeholder="Например: только вечерние выгулы"
                />
              </label>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Какие услуги доступны</span>
                <div className={styles.servicesList}>
                  {store.services.map((service) => {
                    const isChecked = store.windowForm.serviceIds.includes(
                      service.id,
                    );

                    return (
                      <label key={service.id} className={styles.checkboxCard}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => store.toggleWindowService(service.id)}
                        />
                        <span>{service.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {store.windowFormError ? (
                <div className={styles.fieldError}>{store.windowFormError}</div>
              ) : null}

              <button
                type="button"
                className={styles.primaryButton}
                onClick={store.addAvailabilityWindow}
              >
                Добавить частичную доступность для {store.selectedDateLabel}
              </button>

              <div className={styles.windowsList}>
                {store.selectedDateAvailabilityWindows.length > 0 ? (
                  store.selectedDateAvailabilityWindows.map((item) => {
                    const serviceLabels = store.services
                      .filter((service) => item.serviceIds.includes(service.id))
                      .map((service) => service.name);

                    return (
                      <div key={item.id} className={styles.windowCard}>
                        <div className={styles.windowHeader}>
                          <strong>
                            {item.startTime} — {item.endTime}
                          </strong>

                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => store.removeAvailabilityWindow(item.id)}
                          >
                            Удалить
                          </button>
                        </div>

                        <div className={styles.windowServices}>
                          {serviceLabels.join(', ')}
                        </div>

                        {item.comment ? (
                          <div className={styles.windowComment}>
                            {item.comment}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyState}>
                    Для даты {store.selectedDateLabel} частичная доступность пока
                    не настроена.
                  </div>
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>4. Уже занятые слоты</h2>
              <p className={styles.panelDescription}>
                Эти интервалы показываются только для просмотра и помогают не
                забыть, где уже есть записи.
              </p>

              <div className={styles.bookedList}>
                {store.selectedDateBookedSlots.length > 0 ? (
                  store.selectedDateBookedSlots.map((item) => {
                    const serviceLabels = store.services
                      .filter((service) => item.serviceIds.includes(service.id))
                      .map((service) => service.name);

                    return (
                      <div key={item.id} className={styles.bookedCard}>
                        <strong>
                          {item.startTime} — {item.endTime}
                        </strong>
                        <div className={styles.bookedMeta}>
                          {serviceLabels.join(', ')}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyState}>
                    На выбранную дату занятых слотов пока нет.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
});