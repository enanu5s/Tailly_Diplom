// src/features/specialist-profile/model/calendarUtils.ts

import type {
    SpecialistCalendar,
    SpecialistCalendarDayStatus,
} from './types';

export type SpecialistCalendarMonthDay = {
    isoDate: string | null;
    dayNumber: number | null;
    isCurrentMonth: boolean;
    status: SpecialistCalendarDayStatus | null;
};

export const CALENDAR_WEEKDAY_LABELS = [
    'Пн',
    'Вт',
    'Ср',
    'Чт',
    'Пт',
    'Сб',
    'Вс',
] as const;

export const CALENDAR_STATUS_LABELS: Record<
    SpecialistCalendarDayStatus,
    string
> = {
    available: 'Полностью свободный день',
    partially_booked: 'Частично занятый день',
    fully_booked: 'День занят полностью',
    day_off: 'Выходной день',
};

export function formatMonthLabel(date: Date): string {
    const label = new Intl.DateTimeFormat('ru-RU', {
        month: 'long',
        year: 'numeric',
    }).format(date);

    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year} -${month} -${day}`;
}

export function isValidTimeRange(
    startTime: string,
    endTime: string,
): boolean {
    return startTime.trim() !== '' && endTime.trim() !== '' && startTime < endTime;
}

export function getCalendarDayStatus(
    calendar: SpecialistCalendar,
    isoDate: string,
): SpecialistCalendarDayStatus {
    const override = calendar.dayOverrides.find((item) => item.date === isoDate);

    if (override) {
        return override.status;
    }

    const hasAvailabilityWindows = calendar.availabilityWindows.some(
        (item) => item.date === isoDate,
    );

    const hasBookedSlots = calendar.bookedSlots.some(
        (item) => item.date === isoDate,
    );

    if (hasAvailabilityWindows || hasBookedSlots) {
        return 'partially_booked';
    }

    return 'available';
}

export function buildCalendarMonthDays(
    anchorDate: Date,
    calendar: SpecialistCalendar,
): {
    monthLabel: string;
    days: SpecialistCalendarMonthDay[];
} {
    const year = anchorDate.getFullYear();
    const monthIndex = anchorDate.getMonth();

    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const jsWeekday = firstDayOfMonth.getDay();
    const mondayFirstOffset = jsWeekday === 0 ? 6 : jsWeekday - 1;

    const days: SpecialistCalendarMonthDay[] = [];

    for (let index = 0; index < mondayFirstOffset; index += 1) {
        days.push({
            isoDate: null,
            dayNumber: null,
            isCurrentMonth: false,
            status: null,
        });
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
        const currentDate = new Date(year, monthIndex, dayNumber);
        const isoDate = toIsoDate(currentDate);

        days.push({
            isoDate,
            dayNumber,
            isCurrentMonth: true,
            status: getCalendarDayStatus(calendar, isoDate),
        });
    }

    while (days.length % 7 !== 0) {
        days.push({
            isoDate: null,
            dayNumber: null,
            isCurrentMonth: false,
            status: null,
        });
    }

    return {
        monthLabel: formatMonthLabel(new Date(year, monthIndex, 1)),
        days,
    };
}