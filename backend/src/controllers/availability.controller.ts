import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAvailableSlots } from '../services/availability.service.js';
import { createError } from '../middleware/errorHandler.js';

const AvailabilityQuerySchema = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
  serviceId: z.string().uuid('Invalid service ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export async function getAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = AvailabilityQuerySchema.safeParse(req.query);

    if (!validated.success) {
      return next(createError(
        validated.error.flatten().fieldErrors.toString(),
        400
      ));
    }

    const { staffId, serviceId, date } = validated.data;

    // Prevent querying past dates
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const queryDate = new Date(date);

    if (queryDate < today) {
      return next(createError('Cannot query availability for past dates', 400));
    }

    const availability = await getAvailableSlots(staffId, serviceId, date);

    res.json({ data: availability });
  } catch (err) {
    next(err);
  }
}