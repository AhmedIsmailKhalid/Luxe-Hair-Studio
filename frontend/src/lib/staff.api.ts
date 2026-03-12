import { api } from './api';
import type { Staff } from '../../../shared/src/schemas/staff.schema';
import type { Service } from '../../../shared/src/schemas/service.schema';

export interface StaffWithServices extends Omit<Staff, 'id'> {
  id: string;
  staffServices: Array<{
    id: string;
    serviceId: string;
    service: Service;
  }>;
}

export interface StaffResponse {
  data: StaffWithServices[];
}

export interface SingleStaffResponse {
  data: StaffWithServices;
}

export async function fetchStaff(): Promise<StaffWithServices[]> {
  const response = await api.get<StaffResponse>('/api/staff');
  return response.data.data;
}

export async function fetchStaffById(id: string): Promise<StaffWithServices> {
  const response = await api.get<SingleStaffResponse>(`/api/staff/${id}`);
  return response.data.data;
}

export async function fetchStaffForService(serviceId: string): Promise<StaffWithServices[]> {
  const allStaff = await fetchStaff();
  return allStaff.filter(member =>
    member.staffServices.some(ss => ss.serviceId === serviceId)
  );
}