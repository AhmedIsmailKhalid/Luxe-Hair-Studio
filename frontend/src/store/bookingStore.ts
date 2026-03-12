import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Service } from '../../../shared/src/schemas/service.schema';
import type { TimeSlot } from '../../../shared/src/types/booking.types';
import type { StaffWithServices } from '../lib/staff.api';

export type BookingStep = 1 | 2 | 3 | 4 | 5;

export interface ClientDetails {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingState {
  // ─── Step tracking ───────────────────────────────────────────────────────────
  currentStep: BookingStep;

  // ─── Step 1: Service selection ───────────────────────────────────────────────
  selectedService: Service | null;

  // ─── Step 2: Staff selection ─────────────────────────────────────────────────
  selectedStaff: StaffWithServices | null;

  // ─── Step 3: Date & time selection ──────────────────────────────────────────
  selectedDate: string | null;       // YYYY-MM-DD
  selectedSlot: TimeSlot | null;

  // ─── Step 4: Client details ──────────────────────────────────────────────────
  clientDetails: ClientDetails | null;

  // ─── Step 5: Confirmation ────────────────────────────────────────────────────
  confirmedBookingId: string | null;

  // ─── Actions ─────────────────────────────────────────────────────────────────
  setStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  selectService: (service: Service) => void;
  selectStaff: (staff: StaffWithServices) => void;
  selectDate: (date: string) => void;
  selectSlot: (slot: TimeSlot) => void;
  setClientDetails: (details: ClientDetails) => void;
  setConfirmedBookingId: (id: string) => void;

  reset: () => void;
}

const initialState = {
  currentStep: 1 as BookingStep,
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedSlot: null,
  clientDetails: null,
  confirmedBookingId: null,
};

export const useBookingStore = create<BookingState>()(
  devtools(
    set => ({
      ...initialState,

      setStep: step => set({ currentStep: step }, false, 'setStep'),

      nextStep: () =>
        set(
          state => ({
            currentStep: Math.min(state.currentStep + 1, 5) as BookingStep,
          }),
          false,
          'nextStep'
        ),

      prevStep: () =>
        set(
          state => ({
            currentStep: Math.max(state.currentStep - 1, 1) as BookingStep,
          }),
          false,
          'prevStep'
        ),

      selectService: service =>
        set(
          {
            selectedService: service,
            // Reset downstream selections when service changes
            selectedStaff: null,
            selectedDate: null,
            selectedSlot: null,
          },
          false,
          'selectService'
        ),

      selectStaff: staff =>
        set(
          {
            selectedStaff: staff,
            // Reset downstream selections when staff changes
            selectedDate: null,
            selectedSlot: null,
          },
          false,
          'selectStaff'
        ),

      selectDate: date =>
        set(
          {
            selectedDate: date,
            // Reset slot when date changes
            selectedSlot: null,
          },
          false,
          'selectDate'
        ),

      selectSlot: slot => set({ selectedSlot: slot }, false, 'selectSlot'),

      setClientDetails: details =>
        set({ clientDetails: details }, false, 'setClientDetails'),

      setConfirmedBookingId: id =>
        set({ confirmedBookingId: id }, false, 'setConfirmedBookingId'),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'BookingStore' }
  )
);