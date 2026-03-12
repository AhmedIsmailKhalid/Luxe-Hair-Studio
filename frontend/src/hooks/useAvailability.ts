import { useState, useEffect } from 'react';
import { fetchAvailability } from '../lib/availability.api';
import { getErrorMessage } from '../lib/api';
import type { DayAvailability } from '../../../shared/src/types/booking.types';

export interface UseAvailabilityResult {
  availability: DayAvailability | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAvailability(
  staffId: string | null,
  serviceId: string | null,
  date: string | null
): UseAvailabilityResult {
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!staffId || !serviceId || !date) {
      setAvailability(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAvailability(staffId!, serviceId!, date!);
        if (!cancelled) setAvailability(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [staffId, serviceId, date, trigger]);

  return {
    availability,
    isLoading,
    error,
    refetch: () => setTrigger(t => t + 1),
  };
}