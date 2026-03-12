import { api } from './api';
import type { Service } from '../../../shared/src/schemas/service.schema';

export interface ServicesResponse {
  data: Service[];
}

export interface ServiceResponse {
  data: Service;
}

export async function fetchServices(): Promise<Service[]> {
  const response = await api.get<ServicesResponse>('/api/services');
  return response.data.data;
}

export async function fetchServiceById(id: string): Promise<Service> {
  const response = await api.get<ServiceResponse>(`/api/services/${id}`);
  return response.data.data;
}