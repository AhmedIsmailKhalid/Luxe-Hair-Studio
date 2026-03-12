import { api } from './api';
import type { DayAvailability } from '../../../shared/src/types/booking.types';

export interface AvailabilityResponse {
  data: DayAvailability;
}

export async function fetchAvailability(
  staffId: string,
  serviceId: string,
  date: string
): Promise<DayAvailability> {
  const response = await api.get<AvailabilityResponse>('/api/availability', {
    params: { staffId, serviceId, date },
  });
  return response.data.data;
}