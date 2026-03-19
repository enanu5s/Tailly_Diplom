// src/features/service-booking/model/serviceBookingStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { ordersService } from '@/features/orders/service/ordersService';
import type { Pet } from '@/features/pets/model/types';
import { petsService } from '@/features/pets/service/petsService';
import { specialistProfileService } from '@/features/specialist-profile/service/specialistProfileService';
import type { SpecialistProfile } from '@/features/specialist-profile/model/types';

import type {
  BookingDateOption,
  BookingSlot,
  ServiceBookingDraft,
  ServiceBookingLoadParams,
} from './types';

const BOOKING_DRAFT_STORAGE_KEY = 'tailly_service_booking_draft';

type BookingSettings = {
  dayStartTime: string;
  dayEndTime: string;
  slotStepMinutes: number;
  defaultDurationMinutes: number;
};

type BookedSlot = {
  date: string;
  startTime: string;
  endTime: string;
};

function createEmptyDraft(): ServiceBookingDraft {
  return {
    serviceId: '',
    petId: '',
    selectedDate: '',
    selectedSlotId: '',
    comment: '',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(
  source: Record<string, unknown>,
  key: string,
): string | null {
  const value = source[key];

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readBoolean(
  source: Record<string, unknown>,
  key: string,
): boolean | null {
  const value = source[key];

  return typeof value === 'boolean' ? value : null;
}

function readNumber(
  source: Record<string, unknown>,
  key: string,
): number | null {
  const value = source[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
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

function minutesFromTime(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);

  return hours * 60 + minutes;
}

function timeFromMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${pad2(hours)}:${pad2(minutes)}`;
}

function buildIsoDateTime(dateValue: string, timeValue: string): string {
  return new Date(`${dateValue}T${timeValue}:00`).toISOString();
}

function canUseStorage(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  );
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
    const parsed = JSON.parse(raw) as ServiceBookingDraft;

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.serviceId !== 'string' ||
      typeof parsed.petId !== 'string' ||
      typeof parsed.selectedDate !== 'string' ||
      typeof parsed.selectedSlotId !== 'string' ||
      typeof parsed.comment !== 'string'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeStoredDraft(draft: ServiceBookingDraft): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    BOOKING_DRAFT_STORAGE_KEY,
    JSON.stringify(draft),
  );
}

function clearStoredDraft(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
}

function getDefaultBookingSettings(calendar: unknown): BookingSettings {
  const defaults: BookingSettings = {
    dayStartTime: '10:00',
    dayEndTime: '19:00',
    slotStepMinutes: 60,
    defaultDurationMinutes: 60,
  };

  if (!isRecord(calendar)) {
    return defaults;
  }

  const rawSettings = calendar.bookingSettings;

  if (!isRecord(rawSettings)) {
    return defaults;
  }

  return {
    dayStartTime:
      readString(rawSettings, 'dayStartTime') ?? defaults.dayStartTime,
    dayEndTime: readString(rawSettings, 'dayEndTime') ?? defaults.dayEndTime,
    slotStepMinutes:
      readNumber(rawSettings, 'slotStepMinutes') ?? defaults.slotStepMinutes,
    defaultDurationMinutes:
      readNumber(rawSettings, 'defaultDurationMinutes') ??
      defaults.defaultDurationMinutes,
  };
}

function buildSlotsFromRange(
  date: string,
  rangeStart: string,
  rangeEnd: string,
  settings: BookingSettings,
  prefix: string,
  serviceIds?: string[],
): BookingSlot[] {
  const startMinutes = minutesFromTime(rangeStart);
  const endMinutes = minutesFromTime(rangeEnd);
  const duration = Math.max(15, settings.defaultDurationMinutes);
  const step = Math.max(15, settings.slotStepMinutes);

  const slots: BookingSlot[] = [];

  for (
    let current = startMinutes;
    current + duration <= endMinutes;
    current += step
  ) {
    const slotStart = timeFromMinutes(current);
    const slotEnd = timeFromMinutes(current + duration);

    slots.push({
      id: `${prefix}-${date}-${slotStart}-${slotEnd}`,
      date,
      startTime: slotStart,
      endTime: slotEnd,
      startIso: buildIsoDateTime(date, slotStart),
      endIso: buildIsoDateTime(date, slotEnd),
      serviceIds,
    });
  }

  return slots;
}

function normalizeDirectSlots(
  rawList: unknown[],
  settings: BookingSettings,
): BookingSlot[] {
  const slots: BookingSlot[] = [];

  rawList.forEach((item, index) => {
    if (!isRecord(item)) {
      return;
    }

    const isBooked = readBoolean(item, 'isBooked');
    if (isBooked === true) {
      return;
    }

    const date =
      readString(item, 'date') ??
      readString(item, 'isoDate') ??
      readString(item, 'day');

    const startTime =
      readString(item, 'startTime') ??
      readString(item, 'from') ??
      readString(item, 'start');

    const endTime =
      readString(item, 'endTime') ??
      readString(item, 'to') ??
      readString(item, 'end');

    const id = readString(item, 'id') ?? `slot-${index}`;

    const rawServiceIds = item.serviceIds;
    const serviceIds =
      Array.isArray(rawServiceIds) &&
      rawServiceIds.every((value) => typeof value === 'string')
        ? rawServiceIds
        : undefined;

    if (date && startTime && endTime) {
      slots.push({
        id,
        date,
        startTime,
        endTime,
        startIso: buildIsoDateTime(date, startTime),
        endIso: buildIsoDateTime(date, endTime),
        serviceIds,
      });
      return;
    }

    const available =
      readBoolean(item, 'isAvailable') ??
      readBoolean(item, 'available') ??
      true;

    if (!date || available === false) {
      return;
    }

    slots.push(
      ...buildSlotsFromRange(
        date,
        settings.dayStartTime,
        settings.dayEndTime,
        settings,
        id,
        serviceIds,
      ),
    );
  });

  return slots;
}

function normalizeCalendarDays(
  calendar: unknown,
  settings: BookingSettings,
): BookingSlot[] {
  if (!isRecord(calendar)) {
    return [];
  }

  const rawDays = calendar.days;

  if (!Array.isArray(rawDays)) {
    return [];
  }

  const slots: BookingSlot[] = [];

  rawDays.forEach((item, index) => {
    if (!isRecord(item)) {
      return;
    }

    const date =
      readString(item, 'isoDate') ??
      readString(item, 'date') ??
      readString(item, 'day');

    if (!date) {
      return;
    }

    const isWeekend = readBoolean(item, 'isWeekend');
    const isAvailable =
      readBoolean(item, 'isAvailable') ??
      readBoolean(item, 'available') ??
      readBoolean(item, 'hasAvailability');

    const disabled =
      readBoolean(item, 'disabled') ??
      readBoolean(item, 'isDisabled') ??
      false;

    if (disabled) {
      return;
    }

    const rawIntervals = Array.isArray(item.intervals)
      ? item.intervals
      : Array.isArray(item.slots)
        ? item.slots
        : null;

    if (rawIntervals) {
      rawIntervals.forEach((interval, intervalIndex) => {
        if (!isRecord(interval)) {
          return;
        }

        const intervalBooked = readBoolean(interval, 'isBooked');
        if (intervalBooked === true) {
          return;
        }

        const startTime =
          readString(interval, 'startTime') ??
          readString(interval, 'from') ??
          readString(interval, 'start');

        const endTime =
          readString(interval, 'endTime') ??
          readString(interval, 'to') ??
          readString(interval, 'end');

        const serviceIds =
          Array.isArray(interval.serviceIds) &&
          interval.serviceIds.every((value) => typeof value === 'string')
            ? interval.serviceIds
            : undefined;

        const intervalId =
          readString(interval, 'id') ?? `day-${index}-interval-${intervalIndex}`;

        if (startTime && endTime) {
          slots.push({
            id: intervalId,
            date,
            startTime,
            endTime,
            startIso: buildIsoDateTime(date, startTime),
            endIso: buildIsoDateTime(date, endTime),
            serviceIds,
          });
        }
      });

      return;
    }

    if (isAvailable === false || isWeekend === true) {
      return;
    }

    slots.push(
      ...buildSlotsFromRange(
        date,
        settings.dayStartTime,
        settings.dayEndTime,
        settings,
        `generated-${index}`,
      ),
    );
  });

  return slots;
}

function normalizeBookedSlots(calendar: unknown): BookedSlot[] {
  if (!isRecord(calendar) || !Array.isArray(calendar.bookedSlots)) {
    return [];
  }

  return calendar.bookedSlots
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const date = readString(item, 'date');
      const startTime = readString(item, 'startTime');
      const endTime = readString(item, 'endTime');

      if (!date || !startTime || !endTime) {
        return null;
      }

      return {
        date,
        startTime,
        endTime,
      };
    })
    .filter((item): item is BookedSlot => item !== null);
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

function excludeBookedSlots(
  slots: BookingSlot[],
  bookedSlots: BookedSlot[],
): BookingSlot[] {
  if (bookedSlots.length === 0) {
    return slots;
  }

  return slots.filter((slot) => {
    return !bookedSlots.some((booked) => {
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

function uniqueSortedSlots(slots: BookingSlot[]): BookingSlot[] {
  const map = new Map<string, BookingSlot>();

  slots.forEach((slot) => {
    map.set(`${slot.date}-${slot.startTime}-${slot.endTime}`, slot);
  });

  return [...map.values()].sort(
    (a, b) => +new Date(a.startIso) - +new Date(b.startIso),
  );
}

function normalizeCalendarToSlots(calendar: unknown): BookingSlot[] {
  const settings = getDefaultBookingSettings(calendar);
  const bookedSlots = normalizeBookedSlots(calendar);

  let rawSlots: BookingSlot[] = [];

  if (isRecord(calendar) && Array.isArray(calendar.availableSlots)) {
    rawSlots = normalizeDirectSlots(calendar.availableSlots, settings);
  } else if (isRecord(calendar) && Array.isArray(calendar.intervals)) {
    rawSlots = normalizeDirectSlots(calendar.intervals, settings);
  } else if (isRecord(calendar) && Array.isArray(calendar.availabilityWindows)) {
    rawSlots = normalizeDirectSlots(calendar.availabilityWindows, settings);
  } else {
    rawSlots = normalizeCalendarDays(calendar, settings);
  }

  return uniqueSortedSlots(excludeBookedSlots(rawSlots, bookedSlots));
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

function findNearestMatchingSlot(
  slots: BookingSlot[],
  targetDate: string,
  targetStartTime: string,
  targetEndTime: string,
): BookingSlot | null {
  return (
    slots.find(
      (slot) =>
        slot.date === targetDate &&
        slot.startTime === targetStartTime &&
        slot.endTime === targetEndTime,
    ) ?? null
  );
}

function buildRepeatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
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

  get availableDates(): BookingDateOption[] {
    const serviceId = this.draft.serviceId.trim();

    const filtered = serviceId
      ? this.normalizedSlots.filter((slot) => {
          if (!slot.serviceIds || slot.serviceIds.length === 0) {
            return true;
          }

          return slot.serviceIds.includes(serviceId);
        })
      : this.normalizedSlots;

    return buildDateOptions(filtered);
  }

  get availableSlotsForSelectedDate(): BookingSlot[] {
    const selectedDate = this.draft.selectedDate.trim();
    const serviceId = this.draft.serviceId.trim();

    return this.normalizedSlots.filter((slot) => {
      if (slot.date !== selectedDate) {
        return false;
      }

      if (!serviceId) {
        return true;
      }

      if (!slot.serviceIds || slot.serviceIds.length === 0) {
        return true;
      }

      return slot.serviceIds.includes(serviceId);
    });
  }

  get selectedSlot(): BookingSlot | null {
    return (
      this.availableSlotsForSelectedDate.find(
        (slot) => slot.id === this.draft.selectedSlotId,
      ) ?? null
    );
  }

  async load(params: ServiceBookingLoadParams): Promise<void> {
    this.loading = true;
    this.error = null;
    this.submitError = null;

    try {
      const repeatOrderId = params.repeatOrderId?.trim() || null;
      const presetServiceId = params.presetServiceId?.trim() || '';
      const storedDraft = readStoredDraft();

      if (repeatOrderId) {
        const sourceOrder = await ordersService.getServiceOrderById(repeatOrderId);
        const [specialist, pets] = await Promise.all([
          specialistProfileService.getBySlug(sourceOrder.specialistSlug),
          petsService.getPets(),
        ]);

        const slots = normalizeCalendarToSlots(specialist.calendar);
        const repeatDate = sourceOrder.dateFrom.slice(0, 10);
        const repeatStart = buildRepeatTime(sourceOrder.dateFrom);
        const repeatEnd = sourceOrder.dateTo
          ? buildRepeatTime(sourceOrder.dateTo)
          : '';

        const matchingSlot = findNearestMatchingSlot(
          slots.filter((slot) => {
            if (!slot.serviceIds || slot.serviceIds.length === 0) {
              return true;
            }

            return slot.serviceIds.includes(sourceOrder.serviceId);
          }),
          repeatDate,
          repeatStart,
          repeatEnd,
        );

        const fallbackDate =
          matchingSlot?.date ??
          buildDateOptions(
            slots.filter((slot) => {
              if (!slot.serviceIds || slot.serviceIds.length === 0) {
                return true;
              }

              return slot.serviceIds.includes(sourceOrder.serviceId);
            }),
          )[0]?.date ??
          '';

        const fallbackSlot =
          matchingSlot ??
          slots.find((slot) => {
            if (slot.date !== fallbackDate) {
              return false;
            }

            if (!slot.serviceIds || slot.serviceIds.length === 0) {
              return true;
            }

            return slot.serviceIds.includes(sourceOrder.serviceId);
          }) ??
          null;

        runInAction(() => {
          this.specialist = specialist;
          this.pets = pets;
          this.sourceOrderId = sourceOrder.id;
          this.normalizedSlots = slots;
          this.draft = {
            serviceId: sourceOrder.serviceId,
            petId: sourceOrder.petId,
            selectedDate: fallbackDate,
            selectedSlotId: fallbackSlot?.id ?? '',
            comment: sourceOrder.comment ?? '',
          };
          this.loading = false;
        });

        writeStoredDraft(this.draft);
        return;
      }

      const specialistSlug = params.specialistSlug?.trim() || '';

      if (!specialistSlug) {
        throw new Error('Не выбран специалист для оформления заказа.');
      }

      const [specialist, pets] = await Promise.all([
        specialistProfileService.getBySlug(specialistSlug),
        petsService.getPets(),
      ]);

      const slots = normalizeCalendarToSlots(specialist.calendar);
      const serviceId =
        presetServiceId ||
        storedDraft?.serviceId ||
        specialist.services[0]?.id ||
        '';

      const serviceAwareDates = buildDateOptions(
        slots.filter((slot) => {
          if (!serviceId) {
            return true;
          }

          if (!slot.serviceIds || slot.serviceIds.length === 0) {
            return true;
          }

          return slot.serviceIds.includes(serviceId);
        }),
      );

      const selectedDate =
        storedDraft?.selectedDate &&
        serviceAwareDates.some((item) => item.date === storedDraft.selectedDate)
          ? storedDraft.selectedDate
          : serviceAwareDates[0]?.date ?? '';

      const slotsForDate = slots.filter((slot) => {
        if (slot.date !== selectedDate) {
          return false;
        }

        if (!serviceId) {
          return true;
        }

        if (!slot.serviceIds || slot.serviceIds.length === 0) {
          return true;
        }

        return slot.serviceIds.includes(serviceId);
      });

      const selectedSlotId =
        storedDraft?.selectedSlotId &&
        slotsForDate.some((slot) => slot.id === storedDraft.selectedSlotId)
          ? storedDraft.selectedSlotId
          : slotsForDate[0]?.id ?? '';

      runInAction(() => {
        this.specialist = specialist;
        this.pets = pets;
        this.sourceOrderId = null;
        this.normalizedSlots = slots;
        this.draft = {
          serviceId,
          petId: storedDraft?.petId || pets[0]?.id || '',
          selectedDate,
          selectedSlotId,
          comment: storedDraft?.comment || '',
        };
        this.loading = false;
      });

      writeStoredDraft(this.draft);
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
    const nextDates = buildDateOptions(
      this.normalizedSlots.filter((slot) => {
        if (!serviceId) {
          return true;
        }

        if (!slot.serviceIds || slot.serviceIds.length === 0) {
          return true;
        }

        return slot.serviceIds.includes(serviceId);
      }),
    );

    const nextDate =
      nextDates.some((item) => item.date === this.draft.selectedDate)
        ? this.draft.selectedDate
        : nextDates[0]?.date ?? '';

    const nextSlots = this.normalizedSlots.filter((slot) => {
      if (slot.date !== nextDate) {
        return false;
      }

      if (!serviceId) {
        return true;
      }

      if (!slot.serviceIds || slot.serviceIds.length === 0) {
        return true;
      }

      return slot.serviceIds.includes(serviceId);
    });

    this.draft = {
      ...this.draft,
      serviceId,
      selectedDate: nextDate,
      selectedSlotId: nextSlots[0]?.id ?? '',
    };

    writeStoredDraft(this.draft);
  }

  setPetId(petId: string): void {
    this.draft = {
      ...this.draft,
      petId,
    };
    writeStoredDraft(this.draft);
  }

  setSelectedDate(selectedDate: string): void {
    const nextSlots = this.normalizedSlots.filter((slot) => {
      if (slot.date !== selectedDate) {
        return false;
      }

      const serviceId = this.draft.serviceId.trim();

      if (!serviceId) {
        return true;
      }

      if (!slot.serviceIds || slot.serviceIds.length === 0) {
        return true;
      }

      return slot.serviceIds.includes(serviceId);
    });

    this.draft = {
      ...this.draft,
      selectedDate,
      selectedSlotId: nextSlots[0]?.id ?? '',
    };

    writeStoredDraft(this.draft);
  }

  setSelectedSlotId(selectedSlotId: string): void {
    this.draft = {
      ...this.draft,
      selectedSlotId,
    };
    writeStoredDraft(this.draft);
  }

  setComment(comment: string): void {
    this.draft = {
      ...this.draft,
      comment,
    };
    writeStoredDraft(this.draft);
  }

  async submit() {
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

    const slot = this.selectedSlot;

    if (!slot) {
      throw new Error('Выберите доступный слот.');
    }

    this.submitting = true;
    this.submitError = null;

    try {
      const order = await ordersService.createServiceOrder({
        dateFrom: slot.startIso,
        dateTo: slot.endIso,
        petId: pet.id,
        petName: pet.name,
        sitterId: this.specialist.id,
        sitterName: `${this.specialist.main.firstName} ${this.specialist.main.lastName}`.trim(),
        specialistSlug: this.specialist.slug,
        serviceId: service.id,
        serviceTitle: service.name,
        servicePriceUnit: service.priceUnit,
        locationLabel: service.locationLabel,
        comment: this.draft.comment.trim() || undefined,
        price: service.price,
        currency: 'RUB',
      });

      runInAction(() => {
        this.submitting = false;
      });

      this.reset();

      return order;
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