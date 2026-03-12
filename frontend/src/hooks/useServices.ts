import { useState, useEffect } from 'react';
import { fetchServices, fetchServiceById } from '../lib/services.api';
import { getErrorMessage } from '../lib/api';
import type { Service } from '../../../shared/src/schemas/service.schema';

export interface UseServicesResult {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchServices();
        if (!cancelled) setServices(data);
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
    services,
    isLoading,
    error,
    refetch: () => setTrigger(t => t + 1),
  };
}

export interface UseServiceResult {
  service: Service | null;
  isLoading: boolean;
  error: string | null;
}

export function useService(id: string | null): UseServiceResult {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchServiceById(id!);
        if (!cancelled) setService(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { service, isLoading, error };
}