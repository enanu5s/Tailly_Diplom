// src/features/specialist-profile/model/specialistCalendarEditStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import {
  getCalendarDayStatus,
  getDateBookingSummary,
  isValidTimeRange,
  toIsoDate,
} from './calendarUtils';
import { specialistProfileService } from '../service/specialistProfileService';

import type {
  SpecialistCalendar,
  SpecialistCalendarAvailabilityWindow,
  SpecialistCalendarBookingSettings,
  SpecialistCalendarDayStatus,
  SpecialistProfile,
} from './types';

type AvailabilityWindowForm = {
  startTime: string;
  endTime: string;
  serviceIds: string[];
  comment: string;
};

type BulkAvailabilityTemplateForm = {
  startTime: string;
  endTime: string;
  serviceIds: string[];
  comment: string;
  replaceExistingWindows: boolean;
};

function createDefaultBookingSettings(): SpecialistCalendarBookingSettings {
  return {
    dayStartTime: '10:00',
    dayEndTime: '19:00',
    slotStepMinutes: 60,
    defaultDurationMinutes: 60,
  };
}

function createDefaultWindowForm(
  bookingSettings?: SpecialistCalendarBookingSettings,
): AvailabilityWindowForm {
  const settings = bookingSettings ?? createDefaultBookingSettings();

  const endTime = addMinutesToTime(
    settings.dayStartTime,
    settings.defaultDurationMinutes,
  );

  return {
    startTime: settings.dayStartTime,
    endTime: endTime <= settings.dayEndTime ? endTime : settings.dayEndTime,
    serviceIds: [],
    comment: '',
  };
}

function createDefaultBulkTemplateForm(
  bookingSettings?: SpecialistCalendarBookingSettings,
): BulkAvailabilityTemplateForm {
  const base = createDefaultWindowForm(bookingSettings);

  return {
    ...base,
    replaceExistingWindows: false,
  };
}

function normalizeBookingSettings(
  value?: SpecialistCalendar['bookingSettings'],
): SpecialistCalendarBookingSettings {
  const fallback = createDefaultBookingSettings();

  if (!value) {
    return fallback;
  }

  return {
    dayStartTime: /^\d{2}:\d{2}$/.test(value.dayStartTime)
      ? value.dayStartTime
      : fallback.dayStartTime,
    dayEndTime: /^\d{2}:\d{2}$/.test(value.dayEndTime)
      ? value.dayEndTime
      : fallback.dayEndTime,
    slotStepMinutes:
      Number.isFinite(value.slotStepMinutes) && value.slotStepMinutes > 0
        ? Math.round(value.slotStepMinutes)
        : fallback.slotStepMinutes,
    defaultDurationMinutes:
      Number.isFinite(value.defaultDurationMinutes) && value.defaultDurationMinutes > 0
        ? Math.round(value.defaultDurationMinutes)
        : fallback.defaultDurationMinutes,
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

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const safeValue = Math.max(0, Math.min(value, 23 * 60 + 59));
  const hours = Math.floor(safeValue / 60);
  const minutes = safeValue % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function addMinutesToTime(value: string, minutesToAdd: number): string {
  return minutesToTime(timeToMinutes(value) + minutesToAdd);
}

function sortWindows(
  windows: SpecialistCalendarAvailabilityWindow[],
): SpecialistCalendarAvailabilityWindow[] {
  return [...windows].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }

    return a.endTime.localeCompare(b.endTime);
  });
}

function buildWindowId(date: string): string {
  return `window-${date}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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

  selectedStatus: Exclude<SpecialistCalendarDayStatus, 'partially_booked'> = 'available';

  windowForm: AvailabilityWindowForm = createDefaultWindowForm();
  windowFormError: string | null = null;

  bulkTemplateForm: BulkAvailabilityTemplateForm = createDefaultBulkTemplateForm();
  bulkTemplateError: string | null = null;

  bookingSettingsError: string | null = null;

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

    return sortWindows(
      this.editableCalendar.availabilityWindows.filter(
        (item) => item.date === this.selectedDate,
      ),
    );
  }

  get selectedDatesAvailabilityWindows(): SpecialistCalendarAvailabilityWindow[] {
    if (!this.editableCalendar) {
      return [];
    }

    const selected = new Set(this.effectiveSelectedDates);

    return sortWindows(
      this.editableCalendar.availabilityWindows.filter((item) => selected.has(item.date)),
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

  get selectedDateOverrideStatus(): Exclude<
    SpecialistCalendarDayStatus,
    'partially_booked'
  > | null {
    if (!this.editableCalendar) {
      return null;
    }

    const override = this.editableCalendar.dayOverrides.find(
      (item) => item.date === this.selectedDate,
    );

    return override?.status ?? null;
  }

  get selectedDateMetrics() {
    if (!this.editableCalendar) {
      return {
        status: 'available' as SpecialistCalendarDayStatus,
        totalAvailabilityWindows: 0,
        totalBookedSlots: 0,
        freeSlotCandidates: 0,
        totalAvailabilityMinutes: 0,
        bookedMinutes: 0,
      };
    }

    const summary = getDateBookingSummary(this.editableCalendar, this.selectedDate);

    return {
      status: summary.status,
      totalAvailabilityWindows: summary.availabilityWindowsCount,
      totalBookedSlots: summary.bookedSlotsCount,
      freeSlotCandidates: Math.max(
        summary.availabilityWindowsCount - summary.bookedSlotsCount,
        0,
      ),
      totalAvailabilityMinutes: summary.totalAvailabilityMinutes,
      bookedMinutes: summary.bookedMinutes,
    };
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
      return [...this.selectedDates].sort((a, b) => a.localeCompare(b));
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
        this.editableCalendar?.dayOverrides.find((item) => item.date === date)?.status ??
        'available';

      return currentOverride !== this.selectedStatus;
    });
  }

  get bookingSettings(): SpecialistCalendarBookingSettings {
    return normalizeBookingSettings(this.editableCalendar?.bookingSettings);
  }

  async load(slug: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.saveError = null;
    this.saveSuccess = false;
    this.hasUnsavedChanges = false;
    this.bookingSettingsError = null;
    this.bulkTemplateError = null;

    try {
      const profile = await specialistProfileService.getBySlug(slug);
      const today = toIsoDate(new Date());

      runInAction(() => {
        const editableCalendar = JSON.parse(
          JSON.stringify(profile.calendar),
        ) as SpecialistCalendar;

        editableCalendar.bookingSettings = normalizeBookingSettings(
          editableCalendar.bookingSettings,
        );

        this.profile = profile;
        this.editableCalendar = editableCalendar;
        this.selectedDate = today;
        this.selectedDates = [today];
        this.isMultiSelectMode = false;
        this.currentMonth = parseIsoDateToMonthStart(today);
        this.selectedStatus = this.selectedDateOverrideStatus ?? 'available';
        this.windowForm = createDefaultWindowForm(editableCalendar.bookingSettings);
        this.bulkTemplateForm = createDefaultBulkTemplateForm(
          editableCalendar.bookingSettings,
        );
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
    this.bulkTemplateForm = createDefaultBulkTemplateForm();
    this.bulkTemplateError = null;
    this.bookingSettingsError = null;
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
    this.bulkTemplateError = null;
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
    this.bulkTemplateError = null;
    this.saveSuccess = false;
  }

  clearSelectedDates(): void {
    this.selectedDates = [this.selectedDate];
    this.windowFormError = null;
    this.bulkTemplateError = null;
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

    if (this.selectedStatus === 'day_off' || this.selectedStatus === 'fully_booked') {
      this.editableCalendar.availabilityWindows =
        this.editableCalendar.availabilityWindows.filter(
          (item) => !targetDates.includes(item.date),
        );
      this.windowForm = createDefaultWindowForm(this.bookingSettings);
      this.bulkTemplateForm = createDefaultBulkTemplateForm(this.bookingSettings);
      this.windowFormError = null;
      this.bulkTemplateError = null;
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

  setBulkTemplateField<K extends keyof BulkAvailabilityTemplateForm>(
    field: K,
    value: BulkAvailabilityTemplateForm[K],
  ): void {
    this.bulkTemplateForm[field] = value;
    this.bulkTemplateError = null;
    this.saveSuccess = false;
  }

  toggleBulkTemplateService(serviceId: string): void {
    const next = new Set(this.bulkTemplateForm.serviceIds);

    if (next.has(serviceId)) {
      next.delete(serviceId);
    } else {
      next.add(serviceId);
    }

    this.bulkTemplateForm.serviceIds = [...next];
    this.bulkTemplateError = null;
    this.saveSuccess = false;
  }

  setBookingSettingsField<K extends keyof SpecialistCalendarBookingSettings>(
    field: K,
    value: SpecialistCalendarBookingSettings[K],
  ): void {
    if (!this.editableCalendar) {
      return;
    }

    this.editableCalendar.bookingSettings = {
      ...this.bookingSettings,
      [field]:
        field === 'slotStepMinutes' || field === 'defaultDurationMinutes'
          ? Number(value)
          : value,
    };

    this.bookingSettingsError = null;
    this.saveSuccess = false;
    this.hasUnsavedChanges = true;
  }

  resetWindowFormFromBookingSettings(): void {
    this.windowForm = createDefaultWindowForm(this.bookingSettings);
    this.windowFormError = null;
    this.saveSuccess = false;
  }

  resetBulkTemplateFromBookingSettings(): void {
    this.bulkTemplateForm = createDefaultBulkTemplateForm(this.bookingSettings);
    this.bulkTemplateError = null;
    this.saveSuccess = false;
  }

  private validateBookingSettings(): boolean {
    if (!this.editableCalendar) {
      return false;
    }

    const settings = this.bookingSettings;

    if (!isValidTimeRange(settings.dayStartTime, settings.dayEndTime)) {
      this.bookingSettingsError =
        'Укажи корректный рабочий диапазон: начало дня должно быть раньше конца дня.';
      return false;
    }

    if (!Number.isFinite(settings.slotStepMinutes) || settings.slotStepMinutes < 15) {
      this.bookingSettingsError = 'Шаг слотов должен быть не меньше 15 минут.';
      return false;
    }

    if (
      !Number.isFinite(settings.defaultDurationMinutes) ||
      settings.defaultDurationMinutes < 15
    ) {
      this.bookingSettingsError = 'Длительность слота должна быть не меньше 15 минут.';
      return false;
    }

    const rangeMinutes =
      timeToMinutes(settings.dayEndTime) - timeToMinutes(settings.dayStartTime);

    if (settings.defaultDurationMinutes > rangeMinutes) {
      this.bookingSettingsError =
        'Длительность слота не может быть больше рабочего окна дня.';
      return false;
    }

    return true;
  }

  addAvailabilityWindow(): void {
    if (!this.editableCalendar) {
      return;
    }

    if (!this.validateBookingSettings()) {
      return;
    }

    if (!isValidTimeRange(this.windowForm.startTime, this.windowForm.endTime)) {
      this.windowFormError =
        'Укажи корректный диапазон времени: время начала должно быть раньше времени окончания.';
      return;
    }

    if (this.windowForm.serviceIds.length === 0) {
      this.windowFormError = 'Выбери хотя бы одну услугу для выбранной даты.';
      return;
    }

    if (
      this.windowForm.startTime < this.bookingSettings.dayStartTime ||
      this.windowForm.endTime > this.bookingSettings.dayEndTime
    ) {
      this.windowFormError =
        'Частичная доступность должна попадать в рабочее окно, заданное в правилах бронирования.';
      return;
    }

    this.editableCalendar.dayOverrides = this.editableCalendar.dayOverrides.filter(
      (item) => item.date !== this.selectedDate,
    );

    const newWindow: SpecialistCalendarAvailabilityWindow = {
      id: buildWindowId(this.selectedDate),
      date: this.selectedDate,
      startTime: this.windowForm.startTime,
      endTime: this.windowForm.endTime,
      serviceIds: [...this.windowForm.serviceIds],
      comment: this.windowForm.comment.trim() || undefined,
    };

    this.editableCalendar.availabilityWindows = sortWindows([
      ...this.editableCalendar.availabilityWindows,
      newWindow,
    ]);

    this.windowForm = createDefaultWindowForm(this.bookingSettings);
    this.windowFormError = null;
    this.saveSuccess = false;
    this.hasUnsavedChanges = true;
  }

  applyBulkAvailabilityTemplate(): void {
    if (!this.editableCalendar) {
      return;
    }

    if (!this.validateBookingSettings()) {
      return;
    }

    if (this.selectedDatesCount === 0) {
      this.bulkTemplateError = 'Сначала выбери хотя бы одну дату.';
      return;
    }

    if (
      !isValidTimeRange(this.bulkTemplateForm.startTime, this.bulkTemplateForm.endTime)
    ) {
      this.bulkTemplateError =
        'Укажи корректный диапазон времени для пакетного создания.';
      return;
    }

    if (this.bulkTemplateForm.serviceIds.length === 0) {
      this.bulkTemplateError = 'Выбери хотя бы одну услугу для пакетного создания.';
      return;
    }

    if (
      this.bulkTemplateForm.startTime < this.bookingSettings.dayStartTime ||
      this.bulkTemplateForm.endTime > this.bookingSettings.dayEndTime
    ) {
      this.bulkTemplateError =
        'Пакетное окно должно попадать в рабочее время из правил бронирования.';
      return;
    }

    const targetDates = this.effectiveSelectedDates;
    const targetSet = new Set(targetDates);

    if (this.bulkTemplateForm.replaceExistingWindows) {
      this.editableCalendar.availabilityWindows =
        this.editableCalendar.availabilityWindows.filter(
          (item) => !targetSet.has(item.date),
        );
    }

    this.editableCalendar.dayOverrides = this.editableCalendar.dayOverrides.filter(
      (item) => !targetSet.has(item.date),
    );

    const newWindows = targetDates.map((date) => ({
      id: buildWindowId(date),
      date,
      startTime: this.bulkTemplateForm.startTime,
      endTime: this.bulkTemplateForm.endTime,
      serviceIds: [...this.bulkTemplateForm.serviceIds],
      comment: this.bulkTemplateForm.comment.trim() || undefined,
    }));

    this.editableCalendar.availabilityWindows = sortWindows([
      ...this.editableCalendar.availabilityWindows,
      ...newWindows,
    ]);

    this.bulkTemplateError = null;
    this.saveSuccess = false;
    this.hasUnsavedChanges = true;
  }

  clearAvailabilityWindowsForSelectedDates(): void {
    if (!this.editableCalendar) {
      return;
    }

    const targetSet = new Set(this.effectiveSelectedDates);

    this.editableCalendar.availabilityWindows =
      this.editableCalendar.availabilityWindows.filter(
        (item) => !targetSet.has(item.date),
      );

    this.saveSuccess = false;
    this.hasUnsavedChanges = true;
    this.bulkTemplateError = null;
  }

  removeAvailabilityWindow(windowId: string): void {
    if (!this.editableCalendar) {
      return;
    }

    this.editableCalendar.availabilityWindows =
      this.editableCalendar.availabilityWindows.filter((item) => item.id !== windowId);

    this.saveSuccess = false;
    this.hasUnsavedChanges = true;
  }

  async save(): Promise<void> {
    if (!this.profile || !this.editableCalendar) {
      return;
    }

    if (!this.validateBookingSettings()) {
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
          bookingSettings: this.bookingSettings,
        },
      );

      runInAction(() => {
        const editableCalendar = JSON.parse(
          JSON.stringify(updatedProfile.calendar),
        ) as SpecialistCalendar;

        editableCalendar.bookingSettings = normalizeBookingSettings(
          editableCalendar.bookingSettings,
        );

        this.profile = updatedProfile;
        this.editableCalendar = editableCalendar;
        this.selectedStatus = this.selectedDateOverrideStatus ?? 'available';
        this.saveSuccess = true;
        this.hasUnsavedChanges = false;
        this.bookingSettingsError = null;
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
