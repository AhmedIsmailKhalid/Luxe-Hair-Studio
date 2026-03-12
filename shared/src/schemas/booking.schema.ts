import { z } from 'zod';

export const BookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);

export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  staffId: z.string().uuid('Invalid staff ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  clientName: z.string().min(1, 'Name is required'),
  clientEmail: z.string().email('Invalid email address'),
  clientPhone: z.string().min(10, 'Valid phone number is required'),
  notes: z.string().max(500).optional(),
});

export const UpdateBookingSchema = z.object({
  status: BookingStatusSchema,
  notes: z.string().max(500).optional(),
});

export const BookingSchema = CreateBookingSchema.extend({
  id: z.string().uuid(),
  status: BookingStatusSchema,
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  totalPrice: z.number().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;
export type Booking = z.infer<typeof BookingSchema>;