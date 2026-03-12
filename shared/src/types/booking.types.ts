import type { Booking, BookingStatus } from '../schemas/booking.schema';
import type { Service } from '../schemas/service.schema';
import type { Staff } from '../schemas/staff.schema';

export interface BookingWithDetails extends Booking {
  service: Service;
  staff: Staff;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilityQuery {
  staffId: string;
  serviceId: string;
  date: string;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export type { Booking, BookingStatus, Service, Staff };