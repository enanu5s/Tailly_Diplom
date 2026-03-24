// src/features/service-booking/model/serviceBookingStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import type { ServiceBookingMode, ServiceOrder } from '@/features/orders/model/types';
import { ordersService } from '@/features/orders/service/ordersService';
import type { Pet } from '@/features/pets/model/types';
import { petsService } from '@/features/pets/service/petsService';
import type {
  SpecialistCalendar,
  SpecialistProfile,
  SpecialistService,
} from '@/features/specialist-profile/model/types';
import { specialistProfileService } from '@/features/specialist-profile/service/specialistProfileService';

import type {
  BookingDateOption,
  BookingSlot,
  ServiceBookingDraft,
  ServiceBookingLoadParams,
} from './types';

function isIsoDateInOptions(isoDate: string, options: BookingDateOption[]): boolean {
  const normalized = isoDate.trim();

  if (!normalized) {
    return false;
  }

  return options.some((item) => item.date === normalized);
}

const BOOKING_DRAFT_STORAGE_KEY = 'tailly_service_booking_draft_v2';

function createEmptyDraft(): ServiceBookingDraft {
  return {
    specialistSlug: '',
    serviceId: '',
    petId: '',
    selectedDate: '',
    selectedSlotId: '',
    comment: '',
    bookingMode: 'fixed_slot',
    requestedStartDate: '',
    requestedStartTime: '',
    requestedEndDate: '',
    requestedEndTime: '',
    stayCheckInDate: '',
    stayCheckInTime: '',
    stayCheckOutDate: '',
    stayCheckOutTime: '',
  };
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredDraft(): ServiceBookingDraft | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ServiceBookingDraft;
  } catch {
    return null;
  }
}

function writeStoredDraft(draft: ServiceBookingDraft): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(BOOKING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function clearStoredDraft(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
  });
}

function buildIsoDateTime(dateValue: string, timeValue: string): string {
  return new Date(`${dateValue}T${timeValue}:00`).toISOString();
}

function minutesFromTime(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeFromMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${pad2(hours)}:${pad2(minutes)}`;
}

function getInitialPetId(pets: Pet[], storedPetId?: string): string {
  if (storedPetId && pets.some((pet) => pet.id === storedPetId)) {
    return storedPetId;
  }

  return pets[0]?.id ?? '';
}

function getServiceBookingMode(service: SpecialistService | null): ServiceBookingMode {
  return service?.bookingPolicy?.mode ?? 'fixed_slot';
}

function getServiceDurationConfig(service: SpecialistService | null): {
  stepMinutes: number;
  defaultDurationMinutes: number;
} {
  const duration = service?.bookingPolicy?.duration;

  return {
    stepMinutes: Math.max(15, duration?.durationStepMinutes ?? 30),
    defaultDurationMinutes: Math.max(15, duration?.defaultDurationMinutes ?? 60),
  };
}

function getCalendarSettings(calendar: SpecialistCalendar): {
  dayStartTime: string;
  dayEndTime: string;
  slotStepMinutes: number;
  defaultDurationMinutes: number;
} {
  return {
    dayStartTime: calendar.bookingSettings?.dayStartTime ?? '09:00',
    dayEndTime: calendar.bookingSettings?.dayEndTime ?? '21:00',
    slotStepMinutes: Math.max(15, calendar.bookingSettings?.slotStepMinutes ?? 30),
    defaultDurationMinutes: Math.max(
      15,
      calendar.bookingSettings?.defaultDurationMinutes ?? 60,
    ),
  };
}

function hasTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = minutesFromTime(startA);
  const aEnd = minutesFromTime(endA);
  const bStart = minutesFromTime(startB);
  const bEnd = minutesFromTime(endB);

  return aStart < bEnd && bStart < aEnd;
}

function buildDateOptions(slots: BookingSlot[]): BookingDateOption[] {
  const map = new Map<string, BookingDateOption>();

  slots.forEach((slot) => {
    if (!map.has(slot.date)) {
      map.set(slot.date, {
        date: slot.date,
        label: formatDateLabel(slot.date),
      });
    }
  });

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function filterSlotsByService(slots: BookingSlot[], serviceId: string): BookingSlot[] {
  const normalizedServiceId = serviceId.trim();

  if (!normalizedServiceId) {
    return slots;
  }

  return slots.filter((slot) => {
    if (!slot.serviceIds || slot.serviceIds.length === 0) {
      return true;
    }

    return slot.serviceIds.includes(normalizedServiceId);
  });
}

function uniqueSortedSlots(slots: BookingSlot[]): BookingSlot[] {
  const map = new Map<string, BookingSlot>();

  slots.forEach((slot) => {
    map.set(`${slot.date}-${slot.startTime}-${slot.endTime}`, slot);
  });

  return [...map.values()].sort((a, b) => +new Date(a.startIso) - +new Date(b.startIso));
}

function excludeBookedSlots(
  slots: BookingSlot[],
  calendar: SpecialistCalendar,
): BookingSlot[] {
  return slots.filter((slot) => {
    return !calendar.bookedSlots.some((booked) => {
      if (booked.date !== slot.date) {
        return false;
      }

      return hasTimeOverlap(
        slot.startTime,
        slot.endTime,
        booked.startTime,
        booked.endTime,
      );
    });
  });
}

/** Слоты строятся по явным `availabilityWindows` и вычитаются `bookedSlots`.
 * Правила `availabilityRules` / `availabilityOverrides` в моке пока только в данных профиля и не разворачиваются в слоты. */
function buildSlotsFromWindowsForService(
  calendar: SpecialistCalendar,
  service: SpecialistService | null,
): BookingSlot[] {
  const settings = getCalendarSettings(calendar);
  const serviceConfig = getServiceDurationConfig(service);
  const stepMinutes = serviceConfig.stepMinutes || settings.slotStepMinutes;
  const durationMinutes =
    serviceConfig.defaultDurationMinutes || settings.defaultDurationMinutes;
  const serviceId = service?.id ?? '';

  const dayOffSet = new Set(
    calendar.dayOverrides
      .filter((item) => item.status === 'day_off' || item.status === 'fully_booked')
      .map((item) => item.date),
  );

  const slots: BookingSlot[] = [];

  calendar.availabilityWindows.forEach((windowItem) => {
    if (dayOffSet.has(windowItem.date)) {
      return;
    }

    const serviceAllowed =
      windowItem.serviceIds.length === 0 ||
      !serviceId ||
      windowItem.serviceIds.includes(serviceId);

    if (!serviceAllowed) {
      return;
    }

    const startMinutes = minutesFromTime(windowItem.startTime);
    const endMinutes = minutesFromTime(windowItem.endTime);

    for (
      let cursor = startMinutes;
      cursor + durationMinutes <= endMinutes;
      cursor += stepMinutes
    ) {
      const startTime = timeFromMinutes(cursor);
      const endTime = timeFromMinutes(cursor + durationMinutes);

      const startIso = buildIsoDateTime(windowItem.date, startTime);
      const endIso = buildIsoDateTime(windowItem.date, endTime);

      if (new Date(endIso).getTime() <= Date.now()) {
        continue;
      }

      slots.push({
        id: `${windowItem.id}-${startTime}-${endTime}`,
        date: windowItem.date,
        startTime,
        endTime,
        startIso,
        endIso,
        serviceIds: [...windowItem.serviceIds],
      });
    }
  });

  return uniqueSortedSlots(excludeBookedSlots(slots, calendar));
}

function calculateStayDays(checkInIso: string, checkOutIso: string): number {
  const checkIn = new Date(checkInIso);
  const checkOut = new Date(checkOutIso);

  const diffMs = checkOut.getTime() - checkIn.getTime();

  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function buildDefaultDraftForService(
  service: SpecialistService | null,
  specialistSlug: string,
  slots: BookingSlot[],
  pets: Pet[],
  storedDraft?: ServiceBookingDraft | null,
): ServiceBookingDraft {
  const bookingMode = getServiceBookingMode(service);
  const availableDates = buildDateOptions(slots);
  const selectedDate =
    storedDraft?.selectedDate &&
    availableDates.some((item) => item.date === storedDraft.selectedDate)
      ? storedDraft.selectedDate
      : (availableDates[0]?.date ?? '');

  const slotsForDate = slots.filter((slot) => slot.date === selectedDate);
  const selectedSlotId =
    storedDraft?.selectedSlotId &&
    slotsForDate.some((slot) => slot.id === storedDraft.selectedSlotId)
      ? storedDraft.selectedSlotId
      : (slotsForDate[0]?.id ?? '');

  const multiDay = service?.bookingPolicy?.multiDay;
  const checkInTime = multiDay?.checkInTime ?? '13:00';
  const checkOutTime = multiDay?.checkOutTime ?? '11:00';

  const firstDate = availableDates[0]?.date ?? '';
  const secondDate = availableDates[1]?.date ?? firstDate;

  let requestedStartDate = storedDraft?.requestedStartDate ?? firstDate;
  let requestedEndDate = storedDraft?.requestedEndDate ?? firstDate;

  if (bookingMode === 'time_range' || bookingMode === 'open_request') {
    const validStart =
      requestedStartDate &&
      availableDates.some((item) => item.date === requestedStartDate);
    const day = validStart ? requestedStartDate : firstDate;
    requestedStartDate = day;
    requestedEndDate = day;
  }

  return {
    specialistSlug,
    serviceId: service?.id ?? '',
    petId: getInitialPetId(pets, storedDraft?.petId),
    selectedDate,
    selectedSlotId,
    comment: storedDraft?.comment ?? '',
    bookingMode,
    requestedStartDate,
    requestedStartTime: storedDraft?.requestedStartTime ?? '10:00',
    requestedEndDate,
    requestedEndTime: storedDraft?.requestedEndTime ?? '11:30',
    stayCheckInDate: storedDraft?.stayCheckInDate ?? firstDate,
    stayCheckInTime: storedDraft?.stayCheckInTime ?? checkInTime,
    stayCheckOutDate: storedDraft?.stayCheckOutDate ?? secondDate,
    stayCheckOutTime: storedDraft?.stayCheckOutTime ?? checkOutTime,
  };
}

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function buildRepeatDraft(
  order: ServiceOrder,
  service: SpecialistService | null,
  pets: Pet[],
  specialistSlug: string,
  slots: BookingSlot[],
): ServiceBookingDraft {
  const baseDraft = buildDefaultDraftForService(
    service,
    specialistSlug,
    slots,
    pets,
    null,
  );

  if (order.schedule.mode === 'fixed_slot' || order.schedule.mode === 'time_range') {
    const tomorrow = getTomorrowDate();

    const availableDates = buildDateOptions(slots);

    const safeDate =
      availableDates.find((item) => item.date >= tomorrow)?.date ??
      availableDates[0]?.date ??
      tomorrow;

    const slotsForDate = slots.filter((slot) => slot.date === safeDate);
    const matchingSlot = slotsForDate[0] ?? null;

    return {
      ...baseDraft,
      petId: getInitialPetId(pets, order.petId),
      comment: order.comment ?? '',
      bookingMode: order.schedule.mode,
      selectedDate: matchingSlot?.date ?? baseDraft.selectedDate,
      selectedSlotId: matchingSlot?.id ?? baseDraft.selectedSlotId,
      requestedStartDate: safeDate,
      requestedStartTime: matchingSlot?.startTime ?? '10:00',
      requestedEndDate: safeDate,
      requestedEndTime: matchingSlot?.endTime ?? '11:00',
    };
  }

  if (order.schedule.mode === 'multi_day_stay') {
    const tomorrow = getTomorrowDate();

    const availableDates = buildDateOptions(slots);

    const safeStart =
      availableDates.find((item) => item.date >= tomorrow)?.date ??
      availableDates[0]?.date ??
      tomorrow;

    const safeEnd =
      availableDates.find((item) => item.date > safeStart)?.date ?? safeStart;

    return {
      ...baseDraft,
      petId: getInitialPetId(pets, order.petId),
      comment: order.comment ?? '',
      bookingMode: 'multi_day_stay',
      stayCheckInDate: safeStart,
      stayCheckInTime: baseDraft.stayCheckInTime,
      stayCheckOutDate: safeEnd,
      stayCheckOutTime: baseDraft.stayCheckOutTime,
    };
  }

  return {
    ...baseDraft,
    petId: getInitialPetId(pets, order.petId),
    comment: order.comment ?? '',
    bookingMode: 'open_request',
    requestedStartDate: getTomorrowDate(),
  };
}

export class ServiceBookingStore {
  specialist: SpecialistProfile | null = null;
  pets: Pet[] = [];
  draft: ServiceBookingDraft = createEmptyDraft();
  sourceOrderId: string | null = null;
  normalizedSlots: BookingSlot[] = [];
  loading = false;
  error: string | null = null;
  submitting = false;
  submitError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get services() {
    return this.specialist?.services ?? [];
  }

  get selectedService() {
    return this.services.find((item) => item.id === this.draft.serviceId) ?? null;
  }

  get selectedPet() {
    return this.pets.find((item) => item.id === this.draft.petId) ?? null;
  }

  get bookingMode(): ServiceBookingMode {
    return getServiceBookingMode(this.selectedService);
  }

  get availableDates(): BookingDateOption[] {
    return buildDateOptions(
      filterSlotsByService(this.normalizedSlots, this.draft.serviceId),
    );
  }

  /** Даты выезда: не раньше заезда, только из свободных дней. */
  get stayCheckoutDateOptions(): BookingDateOption[] {
    const dates = this.availableDates;
    const checkIn = this.draft.stayCheckInDate.trim();

    if (!checkIn) {
      return dates;
    }

    return dates.filter((item) => item.date >= checkIn);
  }

  get availableSlotsForSelectedDate(): BookingSlot[] {
    const selectedDate = this.draft.selectedDate.trim();

    return filterSlotsByService(this.normalizedSlots, this.draft.serviceId).filter(
      (slot) => slot.date === selectedDate,
    );
  }

  get selectedSlot(): BookingSlot | null {
    return (
      this.availableSlotsForSelectedDate.find(
        (slot) => slot.id === this.draft.selectedSlotId,
      ) ?? null
    );
  }

  get stayDays(): number {
    if (
      !this.draft.stayCheckInDate ||
      !this.draft.stayCheckInTime ||
      !this.draft.stayCheckOutDate ||
      !this.draft.stayCheckOutTime
    ) {
      return 0;
    }

    return calculateStayDays(
      buildIsoDateTime(this.draft.stayCheckInDate, this.draft.stayCheckInTime),
      buildIsoDateTime(this.draft.stayCheckOutDate, this.draft.stayCheckOutTime),
    );
  }

  get estimatedPrice(): number | null {
    const service = this.selectedService;

    if (!service) {
      return null;
    }

    if (this.bookingMode === 'multi_day_stay') {
      return service.price * Math.max(1, this.stayDays);
    }

    return service.price;
  }

  private saveDraft(): void {
    writeStoredDraft(this.draft);
  }

  private replaceDraft(patch: Partial<ServiceBookingDraft>): void {
    this.draft = {
      ...this.draft,
      ...patch,
    };
    this.saveDraft();
  }

  async load(params: ServiceBookingLoadParams): Promise<void> {
    this.loading = true;
    this.error = null;
    this.submitError = null;

    try {
      const repeatOrderId = params.repeatOrderId?.trim() || null;
      const specialistSlug = params.specialistSlug?.trim() || '';
      const presetServiceId = params.presetServiceId?.trim() || '';
      const storedDraft = repeatOrderId ? null : readStoredDraft();

      if (repeatOrderId) {
        clearStoredDraft();
      }

      if (repeatOrderId) {
        const sourceOrder = await ordersService.getServiceOrderById(repeatOrderId);
        const [specialist, pets] = await Promise.all([
          specialistProfileService.getBySlug(sourceOrder.specialistSlug),
          petsService.getPets(),
        ]);

        const selectedService =
          specialist.services.find((item) => item.id === sourceOrder.serviceId) ??
          specialist.services[0] ??
          null;

        const slots = buildSlotsFromWindowsForService(
          specialist.calendar,
          selectedService,
        );

        runInAction(() => {
          this.specialist = specialist;
          this.pets = pets;
          this.sourceOrderId = sourceOrder.id;
          this.normalizedSlots = slots;
          this.draft = buildRepeatDraft(
            sourceOrder,
            selectedService,
            pets,
            specialist.slug,
            slots,
          );
          this.loading = false;
        });

        this.saveDraft();
        return;
      }

      if (!specialistSlug) {
        throw new Error('Не выбран специалист для оформления заказа.');
      }

      const [specialist, pets] = await Promise.all([
        specialistProfileService.getBySlug(specialistSlug),
        petsService.getPets(),
      ]);

      const relevantStoredDraft =
        storedDraft?.specialistSlug === specialist.slug ? storedDraft : null;

      const selectedService =
        specialist.services.find((item) => item.id === presetServiceId) ??
        specialist.services.find((item) => item.id === relevantStoredDraft?.serviceId) ??
        specialist.services[0] ??
        null;

      const slots = buildSlotsFromWindowsForService(specialist.calendar, selectedService);

      runInAction(() => {
        this.specialist = specialist;
        this.pets = pets;
        this.sourceOrderId = null;
        this.normalizedSlots = slots;
        this.draft = buildDefaultDraftForService(
          selectedService,
          specialist.slug,
          slots,
          pets,
          relevantStoredDraft,
        );
        this.loading = false;
      });

      this.saveDraft();
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось подготовить оформление заказа.';
        this.loading = false;
      });
    }
  }

  setServiceId(serviceId: string): void {
    if (!this.specialist) {
      return;
    }

    const service =
      this.specialist.services.find((item) => item.id === serviceId) ?? null;

    const nextSlots = buildSlotsFromWindowsForService(this.specialist.calendar, service);

    this.normalizedSlots = nextSlots;
    this.draft = buildDefaultDraftForService(
      service,
      this.specialist.slug,
      nextSlots,
      this.pets,
      {
        ...this.draft,
        serviceId,
      },
    );
    this.saveDraft();
  }

  setPetId(petId: string): void {
    this.replaceDraft({ petId });
  }

  setSelectedDate(selectedDate: string): void {
    const nextSlots = filterSlotsByService(
      this.normalizedSlots,
      this.draft.serviceId,
    ).filter((slot) => slot.date === selectedDate);

    this.replaceDraft({
      selectedDate,
      selectedSlotId: nextSlots[0]?.id ?? '',
    });
  }

  setSelectedSlotId(selectedSlotId: string): void {
    this.replaceDraft({ selectedSlotId });
  }

  setComment(comment: string): void {
    this.replaceDraft({ comment });
  }

  setRequestedRange(payload: {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
  }): void {
    const nextStartDate =
      payload.startDate !== undefined
        ? payload.startDate
        : this.draft.requestedStartDate;
    let nextEndDate =
      payload.endDate !== undefined ? payload.endDate : this.draft.requestedEndDate;

    // Произвольный интервал и свободный запрос: один календарный день — дата окончания = дата начала.
    if (payload.startDate !== undefined) {
      nextEndDate = nextStartDate;
    } else if (nextStartDate && nextEndDate && nextEndDate < nextStartDate) {
      nextEndDate = nextStartDate;
    }

    this.replaceDraft({
      requestedStartDate: nextStartDate,
      requestedStartTime:
        payload.startTime !== undefined
          ? payload.startTime
          : this.draft.requestedStartTime,
      requestedEndDate: nextEndDate,
      requestedEndTime:
        payload.endTime !== undefined ? payload.endTime : this.draft.requestedEndTime,
    });
  }

  setStayRange(payload: {
    checkInDate?: string;
    checkInTime?: string;
    checkOutDate?: string;
    checkOutTime?: string;
  }): void {
    const nextCheckIn =
      payload.checkInDate !== undefined
        ? payload.checkInDate
        : this.draft.stayCheckInDate;
    let nextCheckOut =
      payload.checkOutDate !== undefined
        ? payload.checkOutDate
        : this.draft.stayCheckOutDate;

    if (nextCheckIn && nextCheckOut && nextCheckOut < nextCheckIn) {
      nextCheckOut = nextCheckIn;
    }

    this.replaceDraft({
      stayCheckInDate: nextCheckIn,
      stayCheckInTime:
        payload.checkInTime !== undefined
          ? payload.checkInTime
          : this.draft.stayCheckInTime,
      stayCheckOutDate: nextCheckOut,
      stayCheckOutTime:
        payload.checkOutTime !== undefined
          ? payload.checkOutTime
          : this.draft.stayCheckOutTime,
    });
  }

  async submit(bookingClient: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  }): Promise<ServiceOrder | null> {
    if (!this.specialist) {
      throw new Error('Специалист не найден.');
    }

    const service = this.selectedService;

    if (!service) {
      throw new Error('Выберите услугу.');
    }

    const pet = this.selectedPet;

    if (!pet) {
      throw new Error('Выберите питомца.');
    }

    if (!bookingClient.id.trim()) {
      throw new Error('Нужно войти в аккаунт, чтобы оформить заказ.');
    }

    const clientName =
      `${bookingClient.firstName?.trim() ?? ''} ${bookingClient.lastName?.trim() ?? ''}`.trim() ||
      bookingClient.name?.trim() ||
      bookingClient.email?.trim() ||
      'Клиент';
    const clientId = bookingClient.id.trim();
    const clientSlug = clientId;

    this.submitting = true;
    this.submitError = null;

    try {
      let payload;

      if (this.bookingMode === 'fixed_slot') {
        const slot = this.selectedSlot;

        if (!slot) {
          throw new Error('Выберите доступный слот.');
        }

        payload = {
          dateFrom: slot.startIso,
          dateTo: slot.endIso,
          schedule: {
            mode: 'fixed_slot' as const,
            startAt: slot.startIso,
            endAt: slot.endIso,
          },
        };
      } else if (this.bookingMode === 'time_range') {
        if (
          !this.draft.requestedStartDate ||
          !this.draft.requestedStartTime ||
          !this.draft.requestedEndDate ||
          !this.draft.requestedEndTime
        ) {
          throw new Error('Укажите дату и время начала и окончания интервала.');
        }

        const startIso = buildIsoDateTime(
          this.draft.requestedStartDate,
          this.draft.requestedStartTime,
        );
        const endIso = buildIsoDateTime(
          this.draft.requestedEndDate,
          this.draft.requestedEndTime,
        );

        const allowedDates = this.availableDates;

        if (
          !isIsoDateInOptions(this.draft.requestedStartDate, allowedDates) ||
          !isIsoDateInOptions(this.draft.requestedEndDate, allowedDates)
        ) {
          throw new Error('Выберите дату только из свободных у специалиста дней.');
        }

        payload = {
          dateFrom: startIso,
          dateTo: endIso,
          schedule: {
            mode: 'time_range' as const,
            startAt: startIso,
            endAt: endIso,
          },
        };
      } else if (this.bookingMode === 'multi_day_stay') {
        if (
          !this.draft.stayCheckInDate ||
          !this.draft.stayCheckInTime ||
          !this.draft.stayCheckOutDate ||
          !this.draft.stayCheckOutTime
        ) {
          throw new Error('Заполни дату и время заезда и выезда.');
        }

        const checkInAt = buildIsoDateTime(
          this.draft.stayCheckInDate,
          this.draft.stayCheckInTime,
        );
        const checkOutAt = buildIsoDateTime(
          this.draft.stayCheckOutDate,
          this.draft.stayCheckOutTime,
        );

        const allowedStayDates = this.availableDates;

        if (
          !isIsoDateInOptions(this.draft.stayCheckInDate, allowedStayDates) ||
          !isIsoDateInOptions(this.draft.stayCheckOutDate, allowedStayDates)
        ) {
          throw new Error('Выберите даты только из свободных у специалиста.');
        }

        payload = {
          dateFrom: checkInAt,
          dateTo: checkOutAt,
          schedule: {
            mode: 'multi_day_stay' as const,
            checkInAt,
            checkOutAt,
            stayDays: this.stayDays,
          },
        };
      } else {
        const allowedOpenDates = this.availableDates;

        if (allowedOpenDates.length === 0) {
          throw new Error('У специалиста нет свободных дат для этой услуги.');
        }

        const requestedDate =
          this.draft.requestedStartDate || allowedOpenDates[0]?.date;

        if (!requestedDate || !isIsoDateInOptions(requestedDate, allowedOpenDates)) {
          throw new Error('Выберите дату из доступных у специалиста.');
        }

        payload = {
          dateFrom: requestedDate
            ? buildIsoDateTime(requestedDate, this.draft.requestedStartTime || '09:00')
            : new Date().toISOString(),
          dateTo: undefined,
          schedule: {
            mode: 'open_request' as const,
            requestedDate: requestedDate || undefined,
            requestedStartTime: this.draft.requestedStartTime || undefined,
            requestedEndTime: this.draft.requestedEndTime || undefined,
          },
        };
      }

      const created = await ordersService.createServiceOrder({
        ...payload,
        petId: pet.id,
        petName: pet.name,
        clientId,
        clientName,
        clientSlug,
        sitterId: this.specialist.id,
        sitterName:
          `${this.specialist.main.firstName} ${this.specialist.main.lastName}`.trim(),
        specialistSlug: this.specialist.slug,
        serviceId: service.id,
        serviceTitle: service.name,
        servicePriceUnit: service.priceUnit,
        bookingMode: this.bookingMode,
        locationLabel: service.locationLabel,
        comment: this.draft.comment.trim() || undefined,
        price: this.estimatedPrice ?? service.price,
        currency: 'RUB',
      });

      runInAction(() => {
        this.submitting = false;
      });

      this.reset();

      return created;
    } catch (error) {
      runInAction(() => {
        this.submitError =
          error instanceof Error ? error.message : 'Не удалось создать заказ.';
        this.submitting = false;
      });

      throw error;
    }
  }

  reset(): void {
    this.specialist = null;
    this.pets = [];
    this.draft = createEmptyDraft();
    this.sourceOrderId = null;
    this.normalizedSlots = [];
    this.loading = false;
    this.error = null;
    this.submitting = false;
    this.submitError = null;
    clearStoredDraft();
  }
}

export const serviceBookingStore = new ServiceBookingStore();
