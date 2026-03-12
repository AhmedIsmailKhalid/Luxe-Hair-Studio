import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import { CreateBookingSchema, UpdateBookingSchema } from 'shared/schemas/booking.schema.js';
import type { BookingStatus } from 'shared/schemas/booking.schema.js';
import { getAvailableSlots } from '../services/availability.service.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../services/email.service.js';
import { sanitiseBookingInput } from '../lib/sanitise.js';

export async function getAllBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, date, staffId } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        ...(status && { status: status as BookingStatus }),
        ...(staffId && { staffId: staffId as string }),
        ...(date && { date: new Date(date as string) }),
      },
      include: {
        service: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
}

export async function getBookingById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!booking) {
      return next(createError('Booking not found', 404));
    }

    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
}

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = CreateBookingSchema.parse(req.body);

    // Sanitise free-text client fields before persistence and email
    const sanitised = sanitiseBookingInput({
      clientName: validated.clientName,
      clientEmail: validated.clientEmail,
      clientPhone: validated.clientPhone,
      notes: validated.notes,
    });

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: validated.serviceId, isActive: true },
    });
    if (!service) return next(createError('Service not found', 404));

    // Verify staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: validated.staffId, isActive: true },
    });
    if (!staff) return next(createError('Staff member not found', 404));

    // Verify the requested slot is still available
    const availability = await getAvailableSlots(
      validated.staffId,
      validated.serviceId,
      validated.date
    );

    const requestedSlot = availability.slots.find(
      slot => slot.startTime === validated.startTime && slot.isAvailable
    );

    if (!requestedSlot) {
      return next(createError('The requested time slot is no longer available', 409));
    }

    // Calculate end time and price
    const [hours, minutes] = validated.startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + service.durationMinutes;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    const booking = await prisma.booking.create({
      data: {
        serviceId: validated.serviceId,
        staffId: validated.staffId,
        date: new Date(validated.date),
        startTime: validated.startTime,
        endTime,
        clientName: sanitised.clientName,
        clientEmail: sanitised.clientEmail,
        clientPhone: sanitised.clientPhone,
        notes: sanitised.notes,
        totalPrice: service.price,
        status: 'pending',
      },
      include: {
        service: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Fire and forget — email failure never blocks a successful booking response
    void sendBookingConfirmation({
      bookingId: booking.id,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      serviceName: booking.service.name,
      staffName: booking.staff.name,
      date: booking.date.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice.toString(),
    });

    res.status(201).json({ data: booking, message: 'Booking created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = UpdateBookingSchema.parse(req.body);

    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return next(createError('Booking not found', 404));
    }

    // Prevent invalid status transitions
    if (existing.status === 'cancelled' || existing.status === 'completed') {
      return next(
        createError(`Cannot update a booking with status: ${existing.status}`, 400)
      );
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: validated,
      include: {
        service: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({ data: booking, message: 'Booking updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return next(createError('Booking not found', 404));
    }

    if (existing.status === 'cancelled') {
      return next(createError('Booking is already cancelled', 400));
    }

    if (existing.status === 'completed') {
      return next(createError('Cannot cancel a completed booking', 400));
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
    });

    // Fetch full booking details for cancellation email
    const fullBooking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        staff: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    if (fullBooking) {
      void sendBookingCancellation({
        bookingId: fullBooking.id,
        clientName: fullBooking.clientName,
        clientEmail: fullBooking.clientEmail,
        serviceName: fullBooking.service.name,
        staffName: fullBooking.staff.name,
        date: fullBooking.date.toISOString(),
        startTime: fullBooking.startTime,
        endTime: fullBooking.endTime,
        totalPrice: fullBooking.totalPrice.toString(),
      });
    }

    res.json({ data: booking, message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
}