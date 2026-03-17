// src/features/specialist-profile/ui/SpecialistMiniCalendar.tsx

import { useNavigate } from 'react-router-dom';

import styles from './SpecialistMiniCalendar.module.css';
import {
    buildCalendarMonthDays,
    CALENDAR_STATUS_LABELS,
    CALENDAR_WEEKDAY_LABELS,
    toIsoDate,
} from '../model/calendarUtils';

import type {
    SpecialistCalendar,
    SpecialistCalendarDayStatus,
} from '../model/types';
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
    'partially_booked',
    'fully_booked',
    'day_off',
];

export function SpecialistMiniCalendar({
    calendar,
    monthDate = new Date(),
    editHref,
}: Props): ReactElement {
    const navigate = useNavigate();
    const { monthLabel, days } = buildCalendarMonthDays(monthDate, calendar);
    const todayIsoDate = toIsoDate(new Date());

    const handleEditCalendarClick = (): void => {
        console.log('MINI CALENDAR EDIT CLICK');
        console.log('EDIT_HREF:', editHref);
        console.log('CURRENT_PATH:', window.location.pathname);

        if (!editHref) {
            console.error('EDIT_HREF IS EMPTY');
            return;
        }

        navigate(editHref);
    };

    return (
        <section className={styles.card} aria-label="Календарь специалиста">
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Календарь</h3>
                    <p className={styles.monthLabel}>{monthLabel}</p>
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
                        isoDate !== null &&
                        isoDate !== todayIsoDate &&
                        isoDate < todayIsoDate;

                    return (
                        <div
                            key={day.isoDate ?? `empty-${index}`}
                            className={`${styles.dayCell} ${day.isCurrentMonth
                                    ? styles.dayCellCurrent
                                    : styles.dayCellEmpty
                                } ${day.status ? STATUS_CLASS_NAMES[day.status] : ''} ${isToday ? styles.today : ''
                                } ${isPast ? styles.pastDay : ''}`}
                        >
                            {day.dayNumber ? (
                                <>
                                    <span className={styles.dayNumber}>
                                        {day.dayNumber}
                                    </span>


                                    {day.status &&
                                        day.status !== 'available' &&
                                        day.status !== 'day_off' ? (
                                        <span
                                            className={styles.dot}
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