// src/features/specialist-profile/model/specialistCalendarEditStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { specialistProfileService } from '../service/specialistProfileService';

import {
    getCalendarDayStatus,
    isValidTimeRange,
    toIsoDate,
} from './calendarUtils';
import type {
    SpecialistCalendar,
    SpecialistCalendarAvailabilityWindow,
    SpecialistCalendarDayStatus,
    SpecialistProfile,
} from './types';

type AvailabilityWindowForm = {
    startTime: string;
    endTime: string;
    serviceIds: string[];
    comment: string;
};

function createDefaultWindowForm(): AvailabilityWindowForm {
    return {
        startTime: '10:00',
        endTime: '18:00',
        serviceIds: [],
        comment: '',
    };
}

function parseIsoDateToMonthStart(isoDate: string): Date {
    const [year, month] = isoDate.split('-').map(Number);

    if (!year || !month) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return new Date(year, month - 1, 1);
}

function formatSelectedDateLabel(isoDate: string): string {
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

export class SpecialistCalendarEditStore {
    profile: SpecialistProfile | null = null;
    editableCalendar: SpecialistCalendar | null = null;

    isLoading = false;
    isSaving = false;
    error: string | null = null;
    saveError: string | null = null;
    saveSuccess = false;
    hasUnsavedChanges = false;

    currentMonth = new Date();
    selectedDate = toIsoDate(new Date());
    selectedDates: string[] = [];
    isMultiSelectMode = false;

    selectedStatus: Exclude<SpecialistCalendarDayStatus, 'partially_booked'> =
        'available';

    windowForm: AvailabilityWindowForm = createDefaultWindowForm();
    windowFormError: string | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get services() {
        return this.profile?.services ?? [];
    }

    get selectedDateLabel(): string {
        return formatSelectedDateLabel(this.selectedDate);
    }

    get selectedDateAvailabilityWindows(): SpecialistCalendarAvailabilityWindow[] {
        if (!this.editableCalendar) {
            return [];
        }

        return this.editableCalendar.availabilityWindows.filter(
            (item) => item.date === this.selectedDate,
        );
    }

    get selectedDateBookedSlots() {
        if (!this.editableCalendar) {
            return [];
        }

        return this.editableCalendar.bookedSlots.filter(
            (item) => item.date === this.selectedDate,
        );
    }

    get selectedDateOverrideStatus():
        | Exclude<SpecialistCalendarDayStatus, 'partially_booked'>
        | null {
        if (!this.editableCalendar) {
            return null;
        }

        const override = this.editableCalendar.dayOverrides.find(
            (item) => item.date === this.selectedDate,
        );

        return override?.status ?? null;
    }

    get selectedDateActualStatus(): SpecialistCalendarDayStatus {
        if (!this.editableCalendar) {
            return 'available';
        }

        return getCalendarDayStatus(this.editableCalendar, this.selectedDate);
    }

    get selectedDateHasPartialAvailability(): boolean {
        return this.selectedDateAvailabilityWindows.length > 0;
    }

    get effectiveSelectedDates(): string[] {
        if (this.isMultiSelectMode && this.selectedDates.length > 0) {
            return [...this.selectedDates];
        }

        return [this.selectedDate];
    }

    get selectedDatesCount(): number {
        return this.effectiveSelectedDates.length;
    }

    get selectedDatesLabel(): string {
        if (this.selectedDatesCount === 1) {
            return this.selectedDateLabel;
        }

        return `Выбрано дней: ${this.selectedDatesCount}`;
    }

    get canApplySelectedStatus(): boolean {
        if (!this.editableCalendar) {
            return false;
        }


        return this.effectiveSelectedDates.some((date) => {
            const currentOverride =
                this.editableCalendar?.dayOverrides.find((item) => item.date === date)
                    ?.status ?? 'available';

            return currentOverride !== this.selectedStatus;
        });
    }

    async load(slug: string): Promise<void> {
        this.isLoading = true;
        this.error = null;
        this.saveError = null;
        this.saveSuccess = false;
        this.hasUnsavedChanges = false;

        try {
            const profile = await specialistProfileService.getBySlug(slug);
            const today = toIsoDate(new Date());

            runInAction(() => {
                this.profile = profile;
                this.editableCalendar = JSON.parse(
                    JSON.stringify(profile.calendar),
                ) as SpecialistCalendar;
                this.selectedDate = today;
                this.selectedDates = [today];
                this.isMultiSelectMode = false;
                this.currentMonth = parseIsoDateToMonthStart(today);
                this.selectedStatus = this.selectedDateOverrideStatus ?? 'available';
            });
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить календарь специалиста.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    reset(): void {
        this.profile = null;
        this.editableCalendar = null;
        this.isLoading = false;
        this.isSaving = false;
        this.error = null;
        this.saveError = null;
        this.saveSuccess = false;
        this.hasUnsavedChanges = false;
        this.currentMonth = new Date();
        this.selectedDate = toIsoDate(new Date());
        this.selectedDates = [];
        this.isMultiSelectMode = false;
        this.selectedStatus = 'available';
        this.windowForm = createDefaultWindowForm();
        this.windowFormError = null;
    }

    setCurrentMonth(date: Date): void {
        this.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    }

    goToPreviousMonth(): void {
        this.currentMonth = new Date(
            this.currentMonth.getFullYear(),
            this.currentMonth.getMonth() - 1,
            1,
        );
    }

    goToNextMonth(): void {
        this.currentMonth = new Date(
            this.currentMonth.getFullYear(),
            this.currentMonth.getMonth() + 1,
            1,
        );
    }

    selectDate(isoDate: string): void {
        this.selectedDate = isoDate;
        this.currentMonth = parseIsoDateToMonthStart(isoDate);
        this.windowFormError = null;
        this.saveSuccess = false;

        if (this.isMultiSelectMode) {
            const exists = this.selectedDates.includes(isoDate);

            if (exists) {
                const nextDates = this.selectedDates.filter((item) => item !== isoDate);
                this.selectedDates = nextDates.length > 0 ? nextDates : [isoDate];
            } else {
                this.selectedDates = [...this.selectedDates, isoDate];
            }
        } else {
            this.selectedDates = [isoDate];
        }

        this.selectedStatus = this.selectedDateOverrideStatus ?? 'available';
    }

    setMultiSelectMode(value: boolean): void {
        this.isMultiSelectMode = value;

        if (value) {
            this.selectedDates = this.selectedDates.includes(this.selectedDate)
                ? [...this.selectedDates]
                : [...this.selectedDates, this.selectedDate];
        } else {
            this.selectedDates = [this.selectedDate];
        }

        this.windowFormError = null;
        this.saveSuccess = false;
    }

    clearSelectedDates(): void {
        this.selectedDates = [this.selectedDate];
        this.windowFormError = null;
        this.saveSuccess = false;
    }

    isDateSelected(isoDate: string): boolean {
        return this.effectiveSelectedDates.includes(isoDate);
    }

    setSelectedStatus(
        value: Exclude<SpecialistCalendarDayStatus, 'partially_booked'>,
    ): void {
        this.selectedStatus = value;
        this.saveSuccess = false;
    }

    applySelectedDayStatus(): void {
        if (!this.editableCalendar) {
            return;
        }

        const targetDates = this.effectiveSelectedDates;

        this.editableCalendar.dayOverrides = this.editableCalendar.dayOverrides.filter(
            (item) => !targetDates.includes(item.date),
        );


        if (this.selectedStatus !== 'available') {
            this.editableCalendar.dayOverrides.push(
                ...targetDates.map((date) => ({
                    date,
                    status: this.selectedStatus,
                })),
            );
        }

        if (
            this.selectedStatus === 'day_off' ||
            this.selectedStatus === 'fully_booked'
        ) {
            this.editableCalendar.availabilityWindows =
                this.editableCalendar.availabilityWindows.filter(
                    (item) => !targetDates.includes(item.date),
                );
            this.windowForm = createDefaultWindowForm();
            this.windowFormError = null;
        }

        this.selectedStatus = this.selectedDateOverrideStatus ?? 'available';
        this.saveSuccess = false;
        this.hasUnsavedChanges = true;
    }

    clearSelectedDayStatus(): void {
        if (!this.editableCalendar) {
            return;
        }

        const targetDates = this.effectiveSelectedDates;

        this.editableCalendar.dayOverrides = this.editableCalendar.dayOverrides.filter(
            (item) => !targetDates.includes(item.date),
        );

        this.selectedStatus = 'available';
        this.saveSuccess = false;
        this.hasUnsavedChanges = true;
    }

    setWindowField<K extends keyof AvailabilityWindowForm>(
        field: K,
        value: AvailabilityWindowForm[K],
    ): void {
        this.windowForm[field] = value;
        this.windowFormError = null;
        this.saveSuccess = false;
    }

    toggleWindowService(serviceId: string): void {
        const next = new Set(this.windowForm.serviceIds);

        if (next.has(serviceId)) {
            next.delete(serviceId);
        } else {
            next.add(serviceId);
        }

        this.windowForm.serviceIds = [...next];
        this.windowFormError = null;
        this.saveSuccess = false;
    }

    addAvailabilityWindow(): void {
        if (!this.editableCalendar) {
            return;
        }

        if (!isValidTimeRange(this.windowForm.startTime, this.windowForm.endTime)) {
            this.windowFormError =
                'Укажи корректный диапазон времени: время начала должно быть раньше времени окончания.';
            return;
        }

        if (this.windowForm.serviceIds.length === 0) {
            this.windowFormError =
                'Выбери хотя бы одну услугу для выбранной даты.';
            return;
        }

        this.editableCalendar.dayOverrides = this.editableCalendar.dayOverrides.filter(
            (item) => item.date !== this.selectedDate,
        );

        const newWindow: SpecialistCalendarAvailabilityWindow = {
            id: `window-${Date.now()}`,
            date: this.selectedDate,
            startTime: this.windowForm.startTime,
            endTime: this.windowForm.endTime,
            serviceIds: [...this.windowForm.serviceIds],
            comment: this.windowForm.comment.trim() || undefined,
        };

        this.editableCalendar.availabilityWindows.push(newWindow);
        this.windowForm = createDefaultWindowForm();
        this.windowFormError = null;
        this.saveSuccess = false;
        this.hasUnsavedChanges = true;
    }

    removeAvailabilityWindow(windowId: string): void {
        if (!this.editableCalendar) {
            return;
        }

        this.editableCalendar.availabilityWindows =
            this.editableCalendar.availabilityWindows.filter(
                (item) => item.id !== windowId,
            );

        this.saveSuccess = false;
        this.hasUnsavedChanges = true;
    }

    async save(): Promise<void> {
        if (!this.profile || !this.editableCalendar) {
            return;
        }

        this.isSaving = true;
        this.saveError = null;
        this.saveSuccess = false;

        try {
            const updatedProfile = await specialistProfileService.updateCalendar(
                this.profile.slug,
                {
                    timezone: this.editableCalendar.timezone,
                    dayOverrides: this.editableCalendar.dayOverrides,
                    availabilityWindows: this.editableCalendar.availabilityWindows,
                },
            );


            runInAction(() => {
                this.profile = updatedProfile;
                this.editableCalendar = JSON.parse(
                    JSON.stringify(updatedProfile.calendar),
                ) as SpecialistCalendar;
                this.selectedStatus = this.selectedDateOverrideStatus ?? 'available';
                this.saveSuccess = true;
                this.hasUnsavedChanges = false;
            });
        } catch (error) {
            runInAction(() => {
                this.saveError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось сохранить календарь специалиста.';
            });
        } finally {
            runInAction(() => {
                this.isSaving = false;
            });
        }
    }
}
