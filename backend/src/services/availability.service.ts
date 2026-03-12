import { prisma } from '../lib/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import type { TimeSlot, DayAvailability } from 'shared/types/booking.types.js';

const SLOT_INTERVAL_MINUTES = 15;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let current = start; current + durationMinutes <= end; current += SLOT_INTERVAL_MINUTES) {
    slots.push(minutesToTime(current));
  }

  return slots;
}

function hasOverlap(
  slotStart: number,
  slotEnd: number,
  bookingStart: number,
  bookingEnd: number
): boolean {
  return slotStart < bookingEnd && slotEnd > bookingStart;
}

export async function getAvailableSlots(
  staffId: string,
  serviceId: string,
  date: string
): Promise<DayAvailability> {
  // Validate staff exists
  const staff = await prisma.staff.findUnique({
    where: { id: staffId, isActive: true },
  });
  if (!staff) throw createError('Staff member not found', 404);

  // Validate service exists
  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
  });
  if (!service) throw createError('Service not found', 404);

  // Get day of week (0 = Sunday)
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getUTCDay();

  // Get staff availability for this day
  const availability = await prisma.staffAvailability.findUnique({
    where: { staffId_dayOfWeek: { staffId, dayOfWeek } },
  });

  if (!availability || !availability.isAvailable) {
    return { date, slots: [] };
  }

  // Get existing bookings for this staff on this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      staffId,
      date: new Date(date),
      status: { in: ['pending', 'confirmed'] },
    },
    select: { startTime: true, endTime: true },
  });

  // Generate all possible slots
  const durationMinutes = service.durationMinutes;
  const possibleSlots = generateSlots(
    availability.startTime,
    availability.endTime,
    durationMinutes
  );

  // Filter out slots that overlap with existing bookings
  const slots: TimeSlot[] = possibleSlots.map(startTime => {
    const slotStart = timeToMinutes(startTime);
    const slotEnd = slotStart + durationMinutes;

    const isBooked = existingBookings.some(booking => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      return hasOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
    });

    const endTime = minutesToTime(slotEnd);

    return {
      startTime,
      endTime,
      isAvailable: !isBooked,
    };
  });

  return { date, slots };
}