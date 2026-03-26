import { useState, useEffect } from 'react';
import { fetchServices, fetchServiceById } from '../lib/services.api';
import { MOCK_SERVICES } from '../lib/mockData';
import type { Service } from '../../../shared/src/schemas/service.schema';

export interface UseServicesResult {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  refetch: () => void;
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([]);
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
        const data = await fetchServices();
        if (!cancelled) setServices(data);
      } catch (err) {
        if (!cancelled) {
          setServices(MOCK_SERVICES as unknown as Service[]);
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
    services,
    isLoading,
    error,
    isUsingMockData,
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
        if (!cancelled) {
          const found = MOCK_SERVICES.find(s => s.id === id) ?? null;
          setService(found as unknown as Service);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { service, isLoading, error };
}