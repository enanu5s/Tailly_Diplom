// src/features/service-booking/model/types.ts

import type { ServiceBookingMode } from '@/features/orders/model/types';

export type ServiceBookingDraft = {
  specialistSlug: string;
  serviceId: string;
  petId: string;
  selectedDate: string;
  selectedSlotId: string;
  comment: string;

  bookingMode: ServiceBookingMode;

  requestedStartDate: string;
  requestedStartTime: string;
  requestedEndDate: string;
  requestedEndTime: string;

  stayCheckInDate: string;
  stayCheckInTime: string;
  stayCheckOutDate: string;
  stayCheckOutTime: string;
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

export type ServiceBookingModeView =
  | 'fixed_slot'
  | 'time_range'
  | 'multi_day_stay'
  | 'open_request';
