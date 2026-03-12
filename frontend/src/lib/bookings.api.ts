import { api } from './api';
import type { CreateBookingInput } from '../../../shared/src/schemas/booking.schema';
import type { BookingWithDetails } from '../../../shared/src/types/booking.types';

export interface BookingResponse {
  data: BookingWithDetails;
  message: string;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingWithDetails> {
  const response = await api.post<BookingResponse>('/api/bookings', input);
  return response.data.data;
}

export async function fetchBookingById(id: string): Promise<BookingWithDetails> {
  const response = await api.get<BookingResponse>(`/api/bookings/${id}`);
  return response.data.data;
}

export async function cancelBooking(id: string): Promise<void> {
  await api.delete(`/api/bookings/${id}`);
}