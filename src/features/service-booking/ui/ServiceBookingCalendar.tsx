// src/features/service-booking/ui/ServiceBookingCalendar.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ServiceBookingMode } from '@/features/orders/model/types';

import styles from './ServiceBookingCalendar.module.css';

import type { BookingDateOption } from '../model/types';
import type { ReactElement } from 'react';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toIsoLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseIso(iso: string): Date {
  const [y, m, day] = iso.split('-').map(Number);

  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

function buildWeekRows(year: number, month: number): { iso: string; inMonth: boolean; day: number }[][] {
  const rows: { iso: string; inMonth: boolean; day: number }[][] = [];
  const first = new Date(year, month, 1);
  const cursor = new Date(first);
  const mondayPad = (first.getDay() + 6) % 7;

  cursor.setDate(1 - mondayPad);

  for (let w = 0; w < 6; w += 1) {
    const row: { iso: string; inMonth: boolean; day: number }[] = [];

    for (let d = 0; d < 7; d += 1) {
      row.push({
        iso: toIsoLocal(cursor),
        inMonth: cursor.getMonth() === month,
        day: cursor.getDate(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    rows.push(row);
  }

  return rows;
}

function isTodayIso(iso: string): boolean {
  return iso === toIsoLocal(new Date());
}

type Props = {
  availableDates: BookingDateOption[];
  bookingMode: ServiceBookingMode;
  anchorIso: string;
  selectedPrimaryIso: string;
  selectedSecondaryIso: string;
  onSelectDay: (iso: string) => void;
};

export function ServiceBookingCalendar({
  availableDates,
  bookingMode,
  anchorIso,
  selectedPrimaryIso,
  selectedSecondaryIso,
  onSelectDay,
}: Props): ReactElement {
  const availableSet = useMemo(
    () => new Set(availableDates.map((item) => item.date)),
    [availableDates],
  );

  const initialView = useMemo(() => {
    const candidate = anchorIso.trim() || availableDates[0]?.date || toIsoLocal(new Date());

    return parseIso(candidate);
  }, [anchorIso, availableDates]);

  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  useEffect(() => {
    const raw = anchorIso.trim() || availableDates[0]?.date;

    if (!raw) {
      return;
    }

    const d = parseIso(raw);

    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [anchorIso, availableDates]);

  const monthTitle = useMemo(
    () =>
      new Date(viewYear, viewMonth, 1).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      }),
    [viewMonth, viewYear],
  );

  const rows = useMemo(() => buildWeekRows(viewYear, viewMonth), [viewMonth, viewYear]);

  const goPrev = useCallback((): void => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goNext = useCallback((): void => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleDayClick = (iso: string, inMonth: boolean): void => {
    if (!inMonth || !availableSet.has(iso)) {
      return;
    }

    onSelectDay(iso);
  };

  const isSelectedCell = (iso: string): boolean => {
    if (bookingMode === 'fixed_slot') {
      return Boolean(selectedPrimaryIso && iso === selectedPrimaryIso);
    }

    if (bookingMode === 'time_range' || bookingMode === 'open_request') {
      return Boolean(selectedPrimaryIso && iso === selectedPrimaryIso);
    }

    if (bookingMode === 'multi_day_stay') {
      return (
        (Boolean(selectedPrimaryIso) && iso === selectedPrimaryIso) ||
        (Boolean(selectedSecondaryIso) && iso === selectedSecondaryIso)
      );
    }

    return false;
  };

  const showRangeStyle = (iso: string): boolean => {
    if (bookingMode !== 'multi_day_stay') {
      return false;
    }

    if (!selectedPrimaryIso || !selectedSecondaryIso) {
      return false;
    }

    if (selectedSecondaryIso <= selectedPrimaryIso) {
      return false;
    }

    return (
      iso > selectedPrimaryIso &&
      iso < selectedSecondaryIso &&
      availableSet.has(iso)
    );
  };

  if (availableDates.length === 0) {
    return (
      <div className={styles.root}>
        <p className={styles.empty}>Нет дат в календаре специалиста для выбранной услуги.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.monthNav}>
        <button type="button" className={styles.navBtn} onClick={goPrev} aria-label="Предыдущий месяц">
          <span className={styles.navIcon} aria-hidden>
            <svg className={`${styles.navSvg} ${styles.navSvgPrev}`} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 7l-5 5 5 5"
                stroke="#211500"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <h3 className={styles.monthTitle}>{monthTitle}</h3>
        <button type="button" className={styles.navBtn} onClick={goNext} aria-label="Следующий месяц">
          <span className={styles.navIcon} aria-hidden>
            <svg className={styles.navSvg} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 7l5 5-5 5"
                stroke="#211500"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={styles.weekday}>
            {wd}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {rows.map((row, ri) =>
          row.map((cell, ci) => {
            const available = availableSet.has(cell.iso);
            const selected = isSelectedCell(cell.iso);
            const today = isTodayIso(cell.iso);
            const rangeMid = showRangeStyle(cell.iso);

            const classNames = [
              styles.dayCell,
              !cell.inMonth ? styles.dayCellOut : '',
              available ? styles.dayCellAvailable : '',
              rangeMid ? styles.dayCellRangeMid : '',
              today && !selected && !rangeMid ? styles.dayCellToday : '',
              selected ? styles.dayCellSelected : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={`${ri}-${ci}-${cell.iso}`}
                type="button"
                className={classNames}
                onClick={() => {
                  handleDayClick(cell.iso, cell.inMonth);
                }}
                disabled={!cell.inMonth || !available}
              >
                <span className={styles.dayNum}>{cell.day}</span>
                {available && cell.inMonth && !selected && !rangeMid ? (
                  <span className={today ? `${styles.dot} ${styles.dotYellow}` : styles.dot} />
                ) : null}
              </button>
            );
          }),
        )}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dot} />
          <span>Свободные даты</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span>Сегодня</span>
        </div>
      </div>
    </div>
  );
}
