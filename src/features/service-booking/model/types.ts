// src/features/service-booking/model/types.ts

export type ServiceBookingDraft = {
  serviceId: string;
  petId: string;
  selectedDate: string;
  selectedSlotId: string;
  comment: string;
};

export type ServiceBookingLoadParams = {
  specialistSlug?: string;
  presetServiceId?: string | null;
  repeatOrderId?: string | null;
};

export type ServiceBookingLocationState = {
  specialistSlug?: string;
  serviceId?: string;
};

export type BookingDateOption = {
  date: string;
  label: string;
};

export type BookingSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  startIso: string;
  endIso: string;
  serviceIds?: string[];
};