// src/features/specialist-profile/ui/SpecialistMiniCalendar.tsx

import { useState } from 'react';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './SpecialistMiniCalendar.module.css';
import {
  buildCalendarMonthDays,
  CALENDAR_STATUS_LABELS,
  CALENDAR_WEEKDAY_LABELS,
  toIsoDate,
} from '../model/calendarUtils';

import type { SpecialistCalendar, SpecialistCalendarDayStatus } from '../model/types';
import type { ReactElement } from 'react';

type Props = {
  calendar: SpecialistCalendar;
  monthDate?: Date;
  editHref?: string;
};

const STATUS_CLASS_NAMES: Record<SpecialistCalendarDayStatus, string> = {
  available: styles.statusAvailable,
  partially_booked: styles.statusPartiallyBooked,
  fully_booked: styles.statusFullyBooked,
  day_off: styles.statusDayOff,
};

const LEGEND_ITEMS: SpecialistCalendarDayStatus[] = [
  'available',
  'partially_booked',
  'fully_booked',
  'day_off',
];

export function SpecialistMiniCalendar({
  calendar,
  monthDate = new Date(),
  editHref,
}: Props): ReactElement {
  const navigate = useAppNavigate();

  const [currentMonth, setCurrentMonth] = useState<Date>(monthDate);
  const { days } = buildCalendarMonthDays(currentMonth, calendar);

  const monthLabel = currentMonth.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
  const todayIsoDate = toIsoDate(new Date());

  const handleEditCalendarClick = (): void => {
    if (!editHref) {
      return;
    }

    navigate(editHref);
  };

  const handlePrevMonth = (): void => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = (): void => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  };

  return (
    <section className={styles.card} aria-label="Календарь специалиста">
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Календарь</h3>

          <div className={styles.monthControls}>
            <button
              type="button"
              className={styles.monthNavButton}
              onClick={handlePrevMonth}
            >
              ←
            </button>

            <p className={styles.monthLabel}>{monthLabel}</p>

            <button
              type="button"
              className={styles.monthNavButton}
              onClick={handleNextMonth}
            >
              →
            </button>
          </div>
        </div>

        {editHref ? (
          <button
            type="button"
            className={styles.editLinkButton}
            onClick={handleEditCalendarClick}
          >
            Редактировать календарь
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

      <div className={styles.grid}>
        {days.map((day, index) => {
          const isToday = day.isoDate === todayIsoDate;
          const isoDate = day.isoDate;

          const isPast =
            isoDate !== null && isoDate !== todayIsoDate && isoDate < todayIsoDate;

          return (
            <div
              key={day.isoDate ?? `empty-${index}`}
              className={`${styles.dayCell} ${
                day.isCurrentMonth ? styles.dayCellCurrent : styles.dayCellEmpty
              } ${day.status ? STATUS_CLASS_NAMES[day.status] : ''} ${
                isToday ? styles.today : ''
              } ${isPast ? styles.pastDay : ''}`}
            >
              {day.dayNumber ? (
                <>
                  <span className={styles.dayNumber}>{day.dayNumber}</span>

                  {day.status === 'partially_booked' ? (
                    <span className={styles.dot} aria-hidden="true" />
                  ) : day.status === 'available' &&
                    day.hasAvailabilityWindows ? (
                    <span
                      className={`${styles.dot} ${styles.dotOpenSlots}`}
                      aria-hidden="true"
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={styles.legend}>
        {LEGEND_ITEMS.map((status) => (
          <div key={status} className={styles.legendItem}>
            <span
              className={`${styles.legendDot} ${STATUS_CLASS_NAMES[status]}`}
              aria-hidden="true"
            />
            <span>{CALENDAR_STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
