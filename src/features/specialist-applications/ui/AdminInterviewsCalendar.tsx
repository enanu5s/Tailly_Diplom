// src/features/specialist-applications/ui/AdminInterviewsCalendar.tsx

import { useEffect, useMemo, useState } from 'react';

import styles from './AdminInterviewsCalendar.module.css';

import type { SpecialistApplication } from '../model/types';
import type { ReactElement } from 'react';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const INTERVIEWS_PER_PAGE = 4;

function dayKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Понедельник 00:00:00 локально для недели, в которой лежит дата. */
function startOfWeekMonday(reference: Date): Date {
  const date = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const dow = date.getDay();
  const shift = dow === 0 ? -6 : 1 - dow;

  date.setDate(date.getDate() + shift);
  date.setHours(0, 0, 0, 0);

  return date;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatWeekRangeLabel(weekStartMonday: Date): string {
  const weekEnd = new Date(weekStartMonday);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const sameMonth =
    weekStartMonday.getMonth() === weekEnd.getMonth() &&
    weekStartMonday.getFullYear() === weekEnd.getFullYear();

  const monthYear = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(weekStartMonday);

  if (sameMonth) {
    return `${weekStartMonday.getDate()}–${weekEnd.getDate()} ${monthYear}`;
  }

  const startPart = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(weekStartMonday);

  const endPart = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(weekEnd);

  return `${startPart} — ${endPart}`;
}

function isUpcomingInterview(iso: string, nowMs: number): boolean {
  const t = new Date(iso).getTime();

  return !Number.isNaN(t) && t >= nowMs;
}

function formatListTime(iso: string): string {
  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

type Props = {
  interviews: SpecialistApplication[];
};

export function AdminInterviewsCalendar({ interviews }: Props): ReactElement {
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [listPage, setListPage] = useState(0);

  const byDayKey = useMemo(() => {
    const map = new Map<string, SpecialistApplication[]>();

    for (const app of interviews) {
      if (!app.interviewDate) {
        continue;
      }

      const d = new Date(app.interviewDate);

      if (Number.isNaN(d.getTime())) {
        continue;
      }

      const key = dayKeyFromDate(d);
      const list = map.get(key) ?? [];
      list.push(app);
      map.set(key, list);
    }

    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime(),
      );
    }

    return map;
  }, [interviews]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }

    return days;
  }, [weekStart]);

  const weekEndExclusive = useMemo(() => {
    const t = new Date(weekStart);
    t.setDate(t.getDate() + 7);
    t.setHours(0, 0, 0, 0);

    return t.getTime();
  }, [weekStart]);

  const nowMs = Date.now();

  const interviewsThisWeek = useMemo(() => {
    const startMs = weekStart.getTime();

    return interviews
      .filter((app) => {
        if (!app.interviewDate) {
          return false;
        }

        const t = new Date(app.interviewDate).getTime();

        if (Number.isNaN(t)) {
          return false;
        }

        return t >= startMs && t < weekEndExclusive && isUpcomingInterview(app.interviewDate, nowMs);
      })
      .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime());
  }, [interviews, weekStart, weekEndExclusive, nowMs]);

  const listPageCount = Math.max(1, Math.ceil(interviewsThisWeek.length / INTERVIEWS_PER_PAGE));
  const visibleInterviews = interviewsThisWeek.slice(
    listPage * INTERVIEWS_PER_PAGE,
    listPage * INTERVIEWS_PER_PAGE + INTERVIEWS_PER_PAGE,
  );
  const canGoPrevList = listPage > 0;
  const canGoNextList = listPage < listPageCount - 1;

  useEffect(() => {
    setListPage(0);
  }, [weekStart]);

  useEffect(() => {
    if (listPage > listPageCount - 1) {
      setListPage(Math.max(0, listPageCount - 1));
    }
  }, [listPage, listPageCount]);

  const goPrevWeek = (): void => {
    setWeekStart((prev) => {
      const n = new Date(prev);
      n.setDate(n.getDate() - 7);

      return n;
    });
  };

  const goNextWeek = (): void => {
    setWeekStart((prev) => {
      const n = new Date(prev);
      n.setDate(n.getDate() + 7);

      return n;
    });
  };

  const goCurrentWeek = (): void => {
    setWeekStart(startOfWeekMonday(new Date()));
  };

  const rangeLabel = formatWeekRangeLabel(weekStart);
  const now = new Date();
  const listRowCount =
    interviewsThisWeek.length > 0
      ? interviewsThisWeek.length > 2
        ? 2
        : 1
      : 0;

  return (
    <section
      className={`${styles.root} ${
        interviewsThisWeek.length === 0 ? styles.rootEmptyWeek : styles.rootHasList
      }`}
      style={
        listRowCount > 0
          ? ({ '--calendar-list-rows': listRowCount } as React.CSSProperties)
          : undefined
      }
      aria-label="Календарь собеседований на неделю"
    >
      <div className={styles.head}>
        <h2 className={styles.title}>Календарь собеседований</h2>
      </div>

      <div className={styles.toolbar}>
        <button
          className={`${styles.navButtonPrev} ${styles.navButton}`}
          type="button"
          onClick={goPrevWeek}
          aria-label="Предыдущая неделя"
        >
          <ArrowIcon />
        </button>
        <div className={styles.toolbarCenter}>
          <span className={styles.weekLabel}>{rangeLabel}</span>
          <button className={styles.todayButton} type="button" onClick={goCurrentWeek}>
            Текущая неделя
          </button>
        </div>
        <button
          className={styles.navButton}
          type="button"
          onClick={goNextWeek}
          aria-label="Следующая неделя"
        >
          <ArrowIcon />
        </button>
      </div>

      <div className={styles.weekRow}>
        {WEEKDAYS.map((label) => (
          <div key={label} className={styles.weekday}>
            {label}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {weekDays.map((dayDate) => {
          const key = dayKeyFromDate(dayDate);
          const dayInterviews = byDayKey
            .get(key)
            ?.filter((app) => isUpcomingInterview(app.interviewDate!, nowMs));
          const has = Boolean(dayInterviews?.length);
          const isToday = isSameCalendarDay(dayDate, now);

          const cellClass = [
            has ? styles.cellBusy : styles.cell,
            isToday ? styles.cellToday : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={key}
              className={cellClass}
              title={
                has
                  ? dayInterviews!
                      .map((a) => `${a.fullName} (${formatListTime(a.interviewDate!)})`)
                      .join('; ')
                  : undefined
              }
            >
              <span className={styles.dayNum}>{dayDate.getDate()}</span>
              {has ? <span className={styles.dot} /> : null}
            </div>
          );
        })}
      </div>

      {interviewsThisWeek.length > 0 ? (
        <div className={styles.listBlock}>
          <h3 className={styles.listTitle}>На этой неделе</h3>
          <div className={styles.listViewport}>
            {listPageCount > 1 ? (
              <button
                className={`${styles.listNavButton} ${styles.listNavButtonPrev}`}
                type="button"
                onClick={() => setListPage((p) => p - 1)}
                disabled={!canGoPrevList}
                aria-label="Предыдущие собеседования"
              >
                <ArrowIcon />
              </button>
            ) : null}
            <ul className={styles.list}>
              {visibleInterviews.map((app) => (
                <li key={app.id} className={styles.listItem}>
                  <span className={styles.listTime}>{formatListTime(app.interviewDate!)}</span>
                  <span className={styles.listName}>{app.fullName}</span>
                  <span className={styles.listMeta}>{app.email}</span>
                </li>
              ))}
            </ul>
            {listPageCount > 1 ? (
              <button
                className={styles.listNavButton}
                type="button"
                onClick={() => setListPage((p) => p + 1)}
                disabled={!canGoNextList}
                aria-label="Следующие собеседования"
              >
                <ArrowIcon />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className={styles.emptyWeek}>На выбранной неделе собеседований нет.</p>
      )}
    </section>
  );
}

function ArrowIcon(): ReactElement {
  return (
    <svg
      width="24"
      height="15"
      viewBox="0 0 24 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.44922 0.949637L0.949612 7.44924M0.949612 7.44924L7.44922 13.9492M0.949612 7.44924L22.9492 7.44918"
        stroke="#211500"
        strokeWidth="1.9"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
