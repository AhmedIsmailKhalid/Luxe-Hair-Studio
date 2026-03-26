import { useState, useEffect } from 'react';
import { fetchStaff, fetchStaffById, fetchStaffForService } from '../lib/staff.api';
import { MOCK_STAFF } from '../lib/mockData';
import type { StaffWithServices } from '../lib/staff.api';

export interface UseStaffResult {
  staff: StaffWithServices[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  refetch: () => void;
}

export function useStaff(): UseStaffResult {
  const [staff, setStaff] = useState<StaffWithServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setIsUsingMockData(false);

      try {
        const data = await fetchStaff();
        if (!cancelled) setStaff(data);
      } catch (err) {
        if (!cancelled) {
          setStaff(MOCK_STAFF);
          setIsUsingMockData(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [trigger]);

  return {
    staff,
    isLoading,
    error,
    isUsingMockData,
    refetch: () => setTrigger(t => t + 1),
  };
}

export interface UseStaffForServiceResult {
  staff: StaffWithServices[];
  isLoading: boolean;
  error: string | null;
}

export function useStaffForService(serviceId: string | null): UseStaffForServiceResult {
  const [staff, setStaff] = useState<StaffWithServices[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchStaffForService(serviceId!);
        if (!cancelled) setStaff(data);
      } catch (err) {
        if (!cancelled) {
          const filtered = MOCK_STAFF.filter(s =>
            s.staffServices.some(ss => ss.serviceId === serviceId)
          );
          setStaff(filtered);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [serviceId]);

  return { staff, isLoading, error };
}

export interface UseStaffMemberResult {
  member: StaffWithServices | null;
  isLoading: boolean;
  error: string | null;
}

export function useStaffMember(id: string | null): UseStaffMemberResult {
  const [member, setMember] = useState<StaffWithServices | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchStaffById(id!);
        if (!cancelled) setMember(data);
      } catch (err) {
        if (!cancelled) {
          const found = MOCK_STAFF.find(s => s.id === id) ?? null;
          setMember(found);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { member, isLoading, error };
}