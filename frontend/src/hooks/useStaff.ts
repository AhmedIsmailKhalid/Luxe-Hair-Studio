import { useState, useEffect } from 'react';
import { fetchStaff, fetchStaffById, fetchStaffForService } from '../lib/staff.api';
import { getErrorMessage } from '../lib/api';
import type { StaffWithServices } from '../lib/staff.api';

export interface UseStaffResult {
  staff: StaffWithServices[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStaff(): UseStaffResult {
  const [staff, setStaff] = useState<StaffWithServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchStaff();
        if (!cancelled) setStaff(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
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
        if (!cancelled) setError(getErrorMessage(err));
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
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { member, isLoading, error };
}