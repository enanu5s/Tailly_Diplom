// src/pages/specialist-calendar-edit/ui/SpecialistCalendarEditPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Link, Navigate, useBlocker, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
  buildCalendarMonthDays,
  CALENDAR_STATUS_LABELS,
  CALENDAR_WEEKDAY_LABELS,
  formatMonthLabel,
  getDateBookingSummary,
  toIsoDate,
} from '@/features/specialist-profile/model/calendarUtils';
import {
  SpecialistCalendarEditStore,
  type WeeklyWeekday,
} from '@/features/specialist-profile/model/specialistCalendarEditStore';
import type { SpecialistCalendar } from '@/features/specialist-profile/model/types';

import {
  CalendarDayContextMenu,
  type CalendarDayMenuItem,
} from './CalendarDayContextMenu';
import {
  confirmBulkReplaceWindows,
  confirmClearAvailabilityWindows,
  confirmClearWeekdayPreset,
  confirmDayStatusOverride,
  confirmLeaveUnsavedPage,
  confirmRemoveAvailabilityWindow,
  confirmWeeklyReplaceExistingWindows,
} from './calendarEditGuards';
import styles from './SpecialistCalendarEditPage.module.css';
import { useCalendarDayPointerMenu } from './useCalendarDayPointerMenu';


const WEEKDAY_CHIPS: { label: string; value: WeeklyWeekday }[] = [
  { label: 'Пн', value: 1 },
  { label: 'Вт', value: 2 },
  { label: 'Ср', value: 3 },
  { label: 'Чт', value: 4 },
  { label: 'Пт', value: 5 },
  { label: 'Сб', value: 6 },
  { label: 'Вс', value: 7 },
];

type EditTab = 'schedule' | 'booking' | 'calendar';

function formatIsoDateRu(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);

  if (!year || !month || !day) {
    return isoDate;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

const WeeklyScheduleSection = observer(function WeeklyScheduleSection({
  store,
}: {
  store: SpecialistCalendarEditStore;
}): ReactElement {
  return (
    <div className={`${styles.panel} ${styles.panelHighlight}`}>
      <h2 className={styles.panelTitle}>Недельный шаблон</h2>
      <p className={styles.lead}>
        Окна создаются на выбранные дни недели, начиная с сегодня. Дни с выходным в
        календаре пропускаются.
      </p>

      <div className={styles.weekdayPresets}>
        <span className={styles.presetLabel}>Часто:</span>
        <button
          type="button"
          className={styles.presetButton}
          onClick={() => store.setWeeklyWeekdaysPreset('weekdays')}
        >
          Пн–Пт
        </button>
        <button
          type="button"
          className={styles.presetButton}
          onClick={() => store.setWeeklyWeekdaysPreset('weekend')}
        >
          Сб–Вс
        </button>
        <button
          type="button"
          className={styles.presetButton}
          onClick={() => store.setWeeklyWeekdaysPreset('all')}
        >
          Каждый день
        </button>
        <button
          type="button"
          className={styles.presetLink}
          onClick={() => {
            if (!confirmClearWeekdayPreset()) {
              return;
            }

            store.setWeeklyWeekdaysPreset('clear');
          }}
        >
          Сбросить
        </button>
      </div>

      <div className={styles.weekdayRow} role="group" aria-label="Дни недели">
        {WEEKDAY_CHIPS.map(({ label, value }) => {
          const active = store.weeklyScheduleForm.weekDays.includes(value);

          return (
            <button
              key={value}
              type="button"
              className={`${styles.weekdayChip} ${active ? styles.weekdayChipActive : ''}`}
              onClick={() => store.toggleWeeklyWeekday(value)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>С</span>
          <input
            className={styles.input}
            type="time"
            value={store.weeklyScheduleForm.startTime}
            onChange={(event) =>
              store.setWeeklyScheduleField('startTime', event.target.value)
            }
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>До</span>
          <input
            className={styles.input}
            type="time"
            value={store.weeklyScheduleForm.endTime}
            onChange={(event) =>
              store.setWeeklyScheduleField('endTime', event.target.value)
            }
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>На сколько недель вперёд</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            max={52}
            value={store.weeklyScheduleForm.weeksAhead}
            onChange={(event) =>
              store.setWeeklyScheduleField(
                'weeksAhead',
                Math.min(52, Math.max(1, Number(event.target.value) || 8)),
              )
            }
          />
        </label>
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={store.weeklyScheduleForm.replaceExisting}
          onChange={(event) =>
            store.setWeeklyScheduleField('replaceExisting', event.target.checked)
          }
        />
        <span>Заменить ранее созданные окна на те же даты</span>
      </label>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Услуги</span>
        <div className={styles.servicesList}>
          {store.services.map((service) => {
            const isChecked = store.weeklyScheduleForm.serviceIds.includes(service.id);

            return (
              <label key={service.id} className={styles.checkboxCard}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => store.toggleWeeklyScheduleService(service.id)}
                />
                <span>{service.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <details className={styles.inlineDetails}>
        <summary className={styles.inlineDetailsSummary}>Необязательно</summary>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Комментарий к окнам</span>
          <input
            className={styles.input}
            type="text"
            value={store.weeklyScheduleForm.comment}
            onChange={(event) =>
              store.setWeeklyScheduleField('comment', event.target.value)
            }
            placeholder="Например: основной приём"
          />
        </label>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={store.resetWeeklyScheduleFromBookingSettings}
        >
          Взять время из параметров слотов
        </button>
      </details>

      {store.weeklyScheduleError ? (
        <div className={styles.fieldError}>{store.weeklyScheduleError}</div>
      ) : null}

      <button
        type="button"
        className={`${styles.primaryButton} ${styles.primaryButtonBlock}`}
        onClick={() => {
          if (store.weeklyScheduleForm.replaceExisting) {
            if (!confirmWeeklyReplaceExistingWindows()) {
              return;
            }
          }

          store.applyWeeklyRecurringSchedule();
        }}
      >
        Создать окна по шаблону
      </button>
    </div>
  );
});

const BookingSettingsSection = observer(function BookingSettingsSection({
  store,
}: {
  store: SpecialistCalendarEditStore;
}): ReactElement {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Параметры записи для клиента</h2>
      <p className={styles.panelDescription}>
        Рабочий день и шаг сетки. Интервалы в шаблоне недели и в календаре должны попадать в
        этот диапазон.
      </p>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Начало рабочего дня</span>
          <input
            className={styles.input}
            type="time"
            value={store.bookingSettings.dayStartTime}
            onChange={(event) =>
              store.setBookingSettingsField('dayStartTime', event.target.value)
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
              store.setBookingSettingsField('dayEndTime', event.target.value)
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
              store.setBookingSettingsField('slotStepMinutes', Number(event.target.value))
            }
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Длительность одного слота, минут</span>
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
        <div className={styles.fieldError}>{store.bookingSettingsError}</div>
      ) : null}

      <div className={styles.note}>
        Например, если рабочий день 10:00–19:00, шаг 30 минут, а длительность слота 60
        минут, клиент увидит слоты вроде 10:00–11:00, 10:30–11:30 и так далее.
      </div>
    </div>
  );
});

function buildDayContextMenuItems(
  store: SpecialistCalendarEditStore,
  isoDate: string,
  calendar: SpecialistCalendar,
): CalendarDayMenuItem[] {
  const inMultiSelection =
    store.isMultiSelectMode && store.selectedDates.includes(isoDate);

  return [
    {
      id: 'select-only',
      label: 'Выбрать только этот день',
      hint: 'Сбросить множественный выбор',
      onSelect: () => {
        store.setMultiSelectMode(false);
        store.selectDate(isoDate);
      },
    },
    {
      id: 'toggle-multi',
      label: inMultiSelection ? 'Убрать из выбора' : 'Добавить к выбору',
      hint: 'Нужно для пакетных действий справа',
      onSelect: () => {
        store.setMultiSelectMode(true);
        store.selectDate(isoDate);
      },
    },
    {
      id: 'day-off',
      label: 'Сделать выходным',
      onSelect: () => {
        store.setMultiSelectMode(false);
        store.selectDate(isoDate);

        if (!confirmDayStatusOverride('day_off', [isoDate], calendar)) {
          return;
        }

        store.setSelectedStatus('day_off');
        store.applySelectedDayStatus();
      },
    },
    {
      id: 'fully-booked',
      label: 'День без записей',
      hint: 'Как «занято» для клиента',
      onSelect: () => {
        store.setMultiSelectMode(false);
        store.selectDate(isoDate);

        if (!confirmDayStatusOverride('fully_booked', [isoDate], calendar)) {
          return;
        }

        store.setSelectedStatus('fully_booked');
        store.applySelectedDayStatus();
      },
    },
    {
      id: 'clear-status',
      label: 'Сбросить статус дня',
      hint: 'Убрать ручной выходной / занятость',
      onSelect: () => {
        store.setMultiSelectMode(false);
        store.selectDate(isoDate);
        store.clearSelectedDayStatus();
      },
    },
    {
      id: 'clear-windows',
      label: 'Очистить окна доступности',
      hint: 'Только для этой даты',
      tone: 'danger',
      onSelect: () => {
        if (!confirmClearAvailabilityWindows(1)) {
          return;
        }

        store.setMultiSelectMode(false);
        store.selectDate(isoDate);
        store.clearAvailabilityWindowsForSelectedDates();
      },
    },
  ];
}

export const SpecialistCalendarEditPage = observer(() => {
  const { specialistSlug } = useParams<{ specialistSlug: string }>();
  const { isAuth, user } = useAuth();
  const [tab, setTab] = useState<EditTab>('calendar');

  const store = useMemo(() => new SpecialistCalendarEditStore(), []);

  const { menuAnchor, closeMenu, suppressNextClickRef, getDayCellPointerProps } =
    useCalendarDayPointerMenu();

  useEffect(() => {
    if (!specialistSlug) {
      return;
    }

    void store.load(specialistSlug);
  }, [specialistSlug, store]);

  useEffect(() => {
    return () => {
      store.reset();
    };
  }, [store]);

  const navigationBlocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      store.hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (navigationBlocker.state !== 'blocked') {
      return;
    }

    const ok = confirmLeaveUnsavedPage();

    if (ok) {
      navigationBlocker.proceed();
    } else {
      navigationBlocker.reset();
    }
  }, [navigationBlocker, navigationBlocker.state]);

  useEffect(() => {
    if (!store.hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [store.hasUnsavedChanges]);

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

  const todayIso = toIsoDate(new Date());

  const selectedDateSummary = getDateBookingSummary(
    store.editableCalendar,
    store.selectedDate,
  );

  const contextMenuItems =
    menuAnchor && store.editableCalendar
      ? buildDayContextMenuItems(store, menuAnchor.isoDate, store.editableCalendar)
      : [];

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topNavRow}>
          <Link
            to={`/specialists/${store.profile.slug}`}
            className={styles.backPill}
            title="Вернуться в профиль специалиста"
          >
            <span className={styles.backPillIcon} aria-hidden>
              ←
            </span>
            Назад
          </Link>
        </div>

        <header className={styles.pageIntro}>
          <div className={styles.pageIntroText}>
            <span className={styles.eyebrow}>Календарь</span>
            <h1 className={styles.title}>Когда вас можно записать</h1>
            <p className={styles.description}>
              Настройте недельный шаблон, правила слотов и точечные дни на вкладках ниже.
              На календаре: обычный выбор — клик или касание; дополнительные действия —
              правый клик на ПК или долгое нажатие на телефоне и планшете.
            </p>
          </div>

          <div className={styles.headerActions}>
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

        <div className={styles.tabsBar}>
          <nav className={styles.tabs} role="tablist" aria-label="Разделы редактирования">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'schedule'}
              className={`${styles.tab} ${tab === 'schedule' ? styles.tabActive : ''}`}
              onClick={() => setTab('schedule')}
            >
              Недельный шаблон
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'booking'}
              className={`${styles.tab} ${tab === 'booking' ? styles.tabActive : ''}`}
              onClick={() => setTab('booking')}
            >
              Параметры записи
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'calendar'}
              className={`${styles.tab} ${tab === 'calendar' ? styles.tabActive : ''}`}
              onClick={() => setTab('calendar')}
            >
              Календарь
            </button>
          </nav>
        </div>

        {store.hasUnsavedChanges ? (
          <div className={styles.warningBanner}>
            Изменения ещё не сохранены — нажмите «Сохранить календарь» вверху справа.
          </div>
        ) : null}

        {store.saveError ? (
          <div className={styles.errorBanner}>{store.saveError}</div>
        ) : null}

        {store.saveSuccess ? (
          <div className={styles.successBanner}>Календарь успешно сохранён.</div>
        ) : null}

        {tab === 'schedule' ? (
          <div className={styles.tabPanel} role="tabpanel">
            <WeeklyScheduleSection store={store} />
          </div>
        ) : null}

        {tab === 'booking' ? (
          <div className={styles.tabPanel} role="tabpanel">
            <BookingSettingsSection store={store} />
          </div>
        ) : null}

        {tab === 'calendar' ? (
          <div className={styles.tabPanel} role="tabpanel">
            <div className={styles.calendarLayout}>
              <div className={styles.calendarColumn}>
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>Месяц</h2>
                  <p className={styles.panelDescription}>
                    Клик — выбрать день. Правый клик (ПК) или долгое нажатие — меню
                    действий. Включите множественный выбор, чтобы задать одно и то же
                    сразу на несколько дат.
                  </p>

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
                        onChange={(event) => store.setMultiSelectMode(event.target.checked)}
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
                      const isPast = day.isoDate !== null && day.isoDate < todayIso;
                      const isToday = day.isoDate !== null && day.isoDate === todayIso;
                      const isSelected = day.isoDate
                        ? store.isDateSelected(day.isoDate)
                        : false;

                      return (
                        <button
                          key={day.isoDate ?? `empty-${index}`}
                          type="button"
                          aria-current={isToday ? 'date' : undefined}
                          className={`${styles.dayButton} ${
                            day.isoDate ? styles.dayButtonActive : styles.dayButtonEmpty
                          } ${isToday ? styles.dayButtonToday : ''} ${
                            isPast ? styles.dayButtonPast : ''
                          } ${isSelected ? styles.dayButtonSelected : ''} ${
                            day.status === 'day_off'
                              ? styles.dayOff
                              : day.status === 'fully_booked'
                                ? styles.fullyBooked
                                : day.status === 'partially_booked'
                                  ? styles.partiallyBooked
                                  : ''
                          }`}
                          disabled={!day.isoDate || isPast}
                          title={
                            isPast
                              ? 'Прошедшие дни нельзя выбрать для правок'
                              : 'Клик — выбрать. ПКМ / долгое нажатие — меню'
                          }
                          {...(day.isoDate && !isPast
                            ? getDayCellPointerProps(day.isoDate, { disabled: false })
                            : {})}
                          onClick={() => {
                            if (suppressNextClickRef.current) {
                              suppressNextClickRef.current = false;

                              return;
                            }

                            if (day.isoDate && !isPast) {
                              store.selectDate(day.isoDate);
                            }
                          }}
                        >
                          {day.dayNumber ? (
                            <>
                              <span className={styles.dayNumber}>{day.dayNumber}</span>
                              <span className={styles.dayMenuHint} aria-hidden="true">
                                ···
                              </span>
                              {day.status === 'partially_booked' ? (
                                <span
                                  className={styles.dayDot}
                                  title={CALENDAR_STATUS_LABELS.partially_booked}
                                />
                              ) : day.status === 'available' &&
                                day.hasAvailabilityWindows ? (
                                <span
                                  className={`${styles.dayDot} ${styles.dayDotOpenSlots}`}
                                  title="На этот день назначены окна доступности"
                                />
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
                      <span className={`${styles.legendMark} ${styles.legendPartial}`} />
                      <span>{CALENDAR_STATUS_LABELS.partially_booked}</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendMark} ${styles.legendFull}`} />
                      <span>{CALENDAR_STATUS_LABELS.fully_booked}</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendMark} ${styles.legendDayOff}`} />
                      <span>{CALENDAR_STATUS_LABELS.day_off}</span>
                    </div>
                  </div>
                  <p className={styles.calendarGridHint}>
                    Жёлтая точка — окна доступности без записей. Оранжевая точка — частичная
                    занятость. Оранжевая обводка — сегодня. «···» напоминает, что у дня есть
                    контекстное меню.
                  </p>
                </div>
              </div>

              <aside className={styles.calendarAside}>
                <div className={styles.selectedDateCard}>
                  <span className={styles.selectedDateCaption}>
                    {store.selectedDatesCount > 1 ? 'Выбранные даты' : 'Выбранная дата'}
                  </span>
                  <div className={styles.selectedDateValue}>{store.selectedDatesLabel}</div>
                  <div className={styles.selectedDateMeta}>
                    <span className={styles.metaChip}>
                      Статус в сетке: {CALENDAR_STATUS_LABELS[store.selectedDateActualStatus]}
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
                      <span className={styles.summaryLabel}>Занятых интервалов</span>
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
                  <h2 className={styles.panelTitle}>Статус выбранных дней</h2>
                  <p className={styles.panelDescription}>
                    {store.selectedDatesCount > 1
                      ? 'Действия применяются ко всем выбранным датам.'
                      : 'Ручной статус перекрывает отображение для клиента, пока вы его не сбросите.'}
                  </p>

                  <div className={styles.statusButtonRow}>
                    <button
                      type="button"
                      className={styles.statusAction}
                      onClick={() => {
                        store.clearSelectedDayStatus();
                      }}
                    >
                      Как по окнам
                    </button>
                    <button
                      type="button"
                      className={styles.statusAction}
                      onClick={() => {
                        if (
                          !confirmDayStatusOverride(
                            'day_off',
                            store.effectiveSelectedDates,
                            store.editableCalendar!,
                          )
                        ) {
                          return;
                        }

                        store.setSelectedStatus('day_off');
                        store.applySelectedDayStatus();
                      }}
                    >
                      Выходной
                    </button>
                    <button
                      type="button"
                      className={styles.statusAction}
                      onClick={() => {
                        if (
                          !confirmDayStatusOverride(
                            'fully_booked',
                            store.effectiveSelectedDates,
                            store.editableCalendar!,
                          )
                        ) {
                          return;
                        }

                        store.setSelectedStatus('fully_booked');
                        store.applySelectedDayStatus();
                      }}
                    >
                      Без записей
                    </button>
                  </div>

                  {store.selectedDateOverrideStatus ? (
                    <p className={styles.overrideNote}>
                      Ручной статус:{' '}
                      <strong>
                        {CALENDAR_STATUS_LABELS[store.selectedDateOverrideStatus]}
                      </strong>
                    </p>
                  ) : (
                    <p className={styles.overrideNote}>Ручной статус не задан.</p>
                  )}
                </div>

                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>Пакетно для выбранных дат</h2>
                  <p className={styles.panelDescription}>
                    Разовые окна не по шаблону недели — выберите даты слева и задайте
                    интервал.
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
                        const isChecked = store.bulkTemplateForm.serviceIds.includes(
                          service.id,
                        );

                        return (
                          <label key={service.id} className={styles.checkboxCard}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => store.toggleBulkTemplateService(service.id)}
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
                    <div className={styles.fieldError}>{store.bulkTemplateError}</div>
                  ) : null}

                  <div className={styles.inlineActions}>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        if (store.bulkTemplateForm.replaceExistingWindows) {
                          if (!confirmBulkReplaceWindows()) {
                            return;
                          }
                        }

                        store.applyBulkAvailabilityTemplate();
                      }}
                    >
                      Создать одинаковые окна
                    </button>

                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => {
                        if (
                          !confirmClearAvailabilityWindows(store.selectedDatesCount)
                        ) {
                          return;
                        }

                        store.clearAvailabilityWindowsForSelectedDates();
                      }}
                    >
                      Очистить окна
                    </button>
                  </div>

                  <div className={styles.note}>
                    При пакетном создании ручные статусы у выбранных дат снимаются, чтобы эти
                    дни можно было бронировать по созданным окнам.
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
                                onClick={() => {
                                  if (!confirmRemoveAvailabilityWindow()) {
                                    return;
                                  }

                                  store.removeAvailabilityWindow(item.id);
                                }}
                              >
                                Удалить
                              </button>
                            </div>

                            <div className={styles.windowServices}>
                              {serviceLabels.join(', ')}
                            </div>

                            {item.comment ? (
                              <div className={styles.windowComment}>{item.comment}</div>
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
                  <h2 className={styles.panelTitle}>Ещё одно окно на активную дату</h2>
                  <p className={styles.panelDescription}>
                    Только для <strong>{store.selectedDateLabel}</strong> — добавить отдельный
                    интервал.
                  </p>

                  <div className={styles.selectedDateInline}>
                    Настраиваемая дата: <strong>{store.selectedDate}</strong>
                  </div>

                  <div className={styles.note}>
                    Окна должны попадать в рабочее время из вкладки «Параметры записи».
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
                        const isChecked = store.windowForm.serviceIds.includes(service.id);

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
                    Добавить окно для {store.selectedDateLabel}
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
                                onClick={() => {
                                  if (!confirmRemoveAvailabilityWindow()) {
                                    return;
                                  }

                                  store.removeAvailabilityWindow(item.id);
                                }}
                              >
                                Удалить
                              </button>
                            </div>

                            <div className={styles.windowServices}>
                              {serviceLabels.join(', ')}
                            </div>

                            {item.comment ? (
                              <div className={styles.windowComment}>{item.comment}</div>
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.emptyState}>
                        Для даты {store.selectedDateLabel} частичная доступность пока не
                        настроена.
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>Занято записями</h2>
                  <p className={styles.panelDescription}>
                    Только просмотр — чтобы не пересечься с уже существующими записями.
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
        ) : null}

        <CalendarDayContextMenu
          anchor={
            menuAnchor
              ? { clientX: menuAnchor.clientX, clientY: menuAnchor.clientY }
              : null
          }
          title={menuAnchor ? formatIsoDateRu(menuAnchor.isoDate) : undefined}
          items={contextMenuItems}
          onRequestClose={closeMenu}
        />
      </div>
    </section>
  );
});
