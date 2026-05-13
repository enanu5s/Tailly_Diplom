// src/pages/specialist-calendar-edit/ui/SpecialistCalendarEditPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Link, Navigate, useBlocker, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
  buildCalendarMonthDays,
  CALENDAR_STATUS_LABELS,
  CALENDAR_WEEKDAY_LABELS,
  formatMonthLabel,
  toIsoDate,
} from '@/features/specialist-profile/model/calendarUtils';
import { SpecialistCalendarEditStore } from '@/features/specialist-profile/model/specialistCalendarEditStore';
import type { SpecialistCalendar } from '@/features/specialist-profile/model/types';

import {
  CalendarDayContextMenu,
  type CalendarDayMenuItem,
} from './CalendarDayContextMenu';
import {
  confirmClearAvailabilityWindows,
  confirmDayStatusOverride,
  confirmLeaveUnsavedPage,
  confirmRemoveAvailabilityWindow,
} from './calendarEditGuards';
import modeSingleDateIconUrl from '@/shared/assets/icons/ic_baseline-today.svg';
import modeMultiDateIconUrl from '@/shared/assets/icons/ic_baseline-today-more.svg';
import deleteWindowIconUrl from '@/shared/assets/icons/fluent-delete-28-regular.svg';

import styles from './SpecialistCalendarEditPage.module.css';
import { useCalendarDayPointerMenu } from './useCalendarDayPointerMenu';

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

function formatAsideDateHeadline(selectedDate: string, todayIso: string, multiCount: number): string {
  if (multiCount > 1) {
    return `Выбрано дней: ${multiCount}`;
  }

  const formatted = formatIsoDateRu(selectedDate);

  if (selectedDate === todayIso) {
    return `Сегодня: ${formatted}`;
  }

  return `Дата: ${formatted}`;
}

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
      hint: 'Несколько дат для массовых правок в календаре',
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

  const contextMenuItems =
    menuAnchor && store.editableCalendar
      ? buildDayContextMenuItems(store, menuAnchor.isoDate, store.editableCalendar)
      : [];

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.figmaPageTop}>
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

          <header className={styles.figmaTitleSaveRow}>
            <div className={styles.pageIntroText}>
              <h1 className={styles.title}>Редактирование календаря занятости</h1>              
            </div>

            <button
              type="button"
              className={`${styles.primaryButton} ${styles.saveCalendarButton}`}
              onClick={() => {
                void store.save();
              }}
              disabled={store.isSaving}
            >
              {store.isSaving ? 'Сохранение...' : 'Сохранить календарь'}
            </button>
          </header>
        </div>

        {store.saveError ? (
          <div className={styles.errorBanner}>{store.saveError}</div>
        ) : null}

        {store.saveSuccess ? (
          <div className={styles.successBanner}>Календарь успешно сохранён.</div>
        ) : null}

        <div className={styles.tabPanel} role="region" aria-label="Календарь доступности">
            <div className={styles.calendarToolsRow}>
              {store.hasUnsavedChanges ? (
                <div className={styles.unsavedSidebarBanner} role="status">
                  Изменения ещё не сохранены — нажмите «Сохранить календарь»
                </div>
              ) : (
                <div className={styles.unsavedSidebarBannerPlaceholder} aria-hidden />
              )}

              <div className={styles.modePillPair} role="group" aria-label="Режим выбора дат">
                <button
                  type="button"
                  className={`${styles.modePill} ${
                    !store.isMultiSelectMode ? styles.modePillActiveGreen : styles.modePillIdle
                  }`}
                  onClick={() => store.setMultiSelectMode(false)}
                >
                  <img
                    src={modeSingleDateIconUrl}
                    alt=""
                    className={styles.modePillIcon}
                    aria-hidden
                  />
                  Одиночный выбор даты
                </button>
                <button
                  type="button"
                  className={`${styles.modePill} ${
                    store.isMultiSelectMode ? styles.modePillActiveGreen : styles.modePillIdle
                  }`}
                  onClick={() => store.setMultiSelectMode(true)}
                >
                  <img
                    src={modeMultiDateIconUrl}
                    alt=""
                    className={styles.modePillIcon}
                    aria-hidden
                  />
                  Множественный выбор дат
                </button>
              </div>
            </div>

            <div className={styles.calendarFigmaGrid}>
              <div className={styles.calendarMainCard}>
                <div className={styles.monthHeader}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={store.goToPreviousMonth}
                    aria-label="Предыдущий месяц"
                  >
                    ←
                  </button>

                  <div className={styles.monthTitle}>{formatMonthLabel(store.currentMonth)}</div>

                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={store.goToNextMonth}
                    aria-label="Следующий месяц"
                  >
                    →
                  </button>
                </div>

                <div className={styles.weekdays}>
                  {CALENDAR_WEEKDAY_LABELS.map((weekday) => (
                    <span key={weekday} className={styles.weekday}>
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className={`${styles.daysGrid} ${styles.daysGridFigma}`}>
                  {calendarMonth.days.map((day, index) => {
                    const isPast = day.isoDate !== null && day.isoDate < todayIso;
                    const isToday = day.isoDate !== null && day.isoDate === todayIso;
                    const isSelected = day.isoDate ? store.isDateSelected(day.isoDate) : false;

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
                            {day.status === 'fully_booked' ? (
                              <span
                                className={styles.dayDot}
                                title={CALENDAR_STATUS_LABELS.fully_booked}
                              />
                            ) : day.status === 'partially_booked' ? (
                              <span
                                className={`${styles.dayDot} ${styles.dayDotOpenSlots}`}
                                title={CALENDAR_STATUS_LABELS.partially_booked}
                              />
                            ) : day.status === 'available' && day.hasAvailabilityWindows ? (
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

                <div className={styles.legendFigma}>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendMark} ${styles.legendMarkOrange}`} />
                    <span className={styles.legendLabelFigma}>Занят</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendMark} ${styles.legendMarkYellow}`} />
                    <span className={styles.legendLabelFigma}>Частично занят</span>
                  </div>
                </div>
              </div>

              <aside className={styles.calendarAsideFigma}>
                <div className={styles.asideCard}>
                  <h2 className={styles.asideCardTitle}>
                    {formatAsideDateHeadline(
                      store.selectedDate,
                      todayIso,
                      store.selectedDatesCount,
                    )}
                  </h2>
                </div>

                <div className={styles.asideCard}>
                  <h2 className={styles.asideCardTitle}>Статус выбранных дней</h2>

                  <div className={styles.statusPillGrid}>
                    <button
                      type="button"
                      className={`${styles.statusPill} ${
                        store.selectedDateOverrideStatus === 'day_off'
                          ? styles.statusPillActiveNeutral
                          : ''
                      }`}
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
                      <span
                        className={`${styles.statusPillDot} ${styles.statusPillDotGrey}`}
                        aria-hidden
                      />
                      Выходной
                    </button>

                    <button
                      type="button"
                      className={`${styles.statusPill} ${
                        store.selectedDateOverrideStatus === 'fully_booked'
                          ? styles.statusPillActiveOrange
                          : ''
                      }`}
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
                      <span
                        className={`${styles.statusPillDot} ${styles.statusPillDotOrange}`}
                        aria-hidden
                      />
                      Весь день занят
                    </button>

                    <button
                      type="button"
                      className={`${styles.statusPill} ${
                        !store.selectedDateOverrideStatus &&
                        store.selectedDateActualStatus === 'partially_booked'
                          ? styles.statusPillActiveYellow
                          : ''
                      }`}
                      onClick={() => {
                        store.clearSelectedDayStatus();
                      }}
                    >
                      <span
                        className={`${styles.statusPillDot} ${styles.statusPillDotYellow}`}
                        aria-hidden
                      />
                      День частично занят
                    </button>

                    <button
                      type="button"
                      className={`${styles.statusPill} ${styles.statusPillGhost}`}
                      onClick={() => {
                        if (store.isMultiSelectMode && store.selectedDatesCount > 1) {
                          store.clearSelectedDates();
                        } else {
                          store.clearSelectedDayStatus();
                        }
                      }}
                    >
                      Очистить
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
                    <p className={styles.overrideNote}>
                      По окнам: {CALENDAR_STATUS_LABELS[store.selectedDateActualStatus]}
                    </p>
                  )}
                </div>

                <div className={styles.asideCard}>
                  <h2 className={styles.asideCardTitle}>Добавление услуги</h2>

                  <div className={styles.fieldRow}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>С</span>
                      <div className={styles.timeFieldWrap}>
                        <input
                          className={styles.input}
                          type="time"
                          value={store.windowForm.startTime}
                          onChange={(event) =>
                            store.setWindowField('startTime', event.target.value)
                          }
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>До</span>
                      <div className={styles.timeFieldWrap}>
                        <input
                          className={styles.input}
                          type="time"
                          value={store.windowForm.endTime}
                          onChange={(event) =>
                            store.setWindowField('endTime', event.target.value)
                          }
                        />
                      </div>
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Услуга</span>
                    <select
                      className={styles.input}
                      value={store.windowForm.serviceIds[0] ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;

                        store.setWindowField(
                          'serviceIds',
                          value ? [value] : [],
                        );
                      }}
                    >
                      <option value="">Выберите услугу</option>
                      {store.services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Комментарий</span>
                    <input
                      className={styles.input}
                      type="text"
                      value={store.windowForm.comment}
                      onChange={(event) => store.setWindowField('comment', event.target.value)}
                      placeholder="Например: только вечерние выгулы"
                    />
                  </label>

                  {store.windowFormError ? (
                    <div className={styles.fieldError}>{store.windowFormError}</div>
                  ) : null}

                  <button
                    type="button"
                    className={`${styles.primaryButton} ${styles.addServiceButton}`}
                    onClick={store.addAvailabilityWindow}
                  >
                    Добавить услугу
                  </button>

                  {store.selectedDateBookedSlots.length > 0 ? (
                    <>
                      <p className={styles.asideSectionHeading}>Записи клиентов</p>
                      <div className={styles.windowsList}>
                        {store.selectedDateBookedSlots.map((item) => {
                          const bookedServiceLabels = store.services
                            .filter((service) => item.serviceIds.includes(service.id))
                            .map((service) => service.name);

                          const bookedServiceTitle =
                            bookedServiceLabels.length > 0
                              ? bookedServiceLabels.join(', ')
                              : 'Услуга';

                          const bufferParts: string[] = [];

                          if (item.bufferBeforeMinutes) {
                            bufferParts.push(`буфер до: ${item.bufferBeforeMinutes} мин`);
                          }

                          if (item.bufferAfterMinutes) {
                            bufferParts.push(`буфер после: ${item.bufferAfterMinutes} мин`);
                          }

                          return (
                            <div key={item.id} className={styles.windowCard}>
                              <div className={styles.windowCardMainRow}>
                                <div className={styles.bookedRowSpacer} aria-hidden />
                                <p className={styles.windowServiceTitle}>{bookedServiceTitle}</p>
                                <span className={styles.windowTime}>
                                  {item.startTime} - {item.endTime}
                                </span>
                              </div>
                              {bufferParts.length > 0 ? (
                                <div className={styles.bookedMeta}>{bufferParts.join(' · ')}</div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {store.selectedDateAvailabilityWindows.length > 0 ? (
                    <div className={styles.windowsList}>
                      {store.selectedDateAvailabilityWindows.map((item) => {
                        const serviceLabels = store.services
                          .filter((service) => item.serviceIds.includes(service.id))
                          .map((service) => service.name);

                        const serviceTitle =
                          serviceLabels.length > 0 ? serviceLabels.join(', ') : 'Услуга';

                        return (
                          <div key={item.id} className={styles.windowCard}>
                            <div className={styles.windowCardMainRow}>
                              <button
                                type="button"
                                className={styles.windowDeleteButton}
                                aria-label="Удалить"
                                onClick={() => {
                                  if (!confirmRemoveAvailabilityWindow()) {
                                    return;
                                  }

                                  store.removeAvailabilityWindow(item.id);
                                }}
                              >
                                <img
                                  src={deleteWindowIconUrl}
                                  alt=""
                                  width={32}
                                  height={32}
                                  className={styles.windowDeleteIcon}
                                />
                              </button>

                              <p className={styles.windowServiceTitle}>{serviceTitle}</p>

                              <span className={styles.windowTime}>
                                {item.startTime} - {item.endTime}
                              </span>
                            </div>

                            {item.comment ? (
                              <div className={styles.windowComment}>{item.comment}</div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </aside>
            </div>
        </div>

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
