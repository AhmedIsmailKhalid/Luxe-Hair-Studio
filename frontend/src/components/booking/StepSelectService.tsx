import React from 'react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatPrice, formatDuration } from '@/lib/utils';
import { useServices } from '@/hooks/useServices';
import { useBookingStore } from '@/store/bookingStore';
import type { Service } from '../../../../shared/src/schemas/service.schema';

type Category = 'all' | 'haircut' | 'color' | 'treatment' | 'styling' | 'other';

const categoryLabels: Record<string, string> = {
  all: 'All',
  haircut: 'Haircuts',
  color: 'Colour',
  treatment: 'Treatments',
  styling: 'Styling',
  other: 'Other',
};

interface StepSelectServiceProps {
  preSelectedServiceId: string | null;
}

export function StepSelectService({ preSelectedServiceId }: StepSelectServiceProps) {
  const { services, isLoading, error } = useServices();
  const { selectedService, selectService, nextStep } = useBookingStore();

  // Auto-select if coming from Services page with a serviceId param
  useEffect(() => {
    if (preSelectedServiceId && services.length > 0 && !selectedService) {
      const match = services.find(s => s.id === preSelectedServiceId);
      if (match) selectService(match);
    }
  }, [preSelectedServiceId, services, selectedService, selectService]);

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))] as Category[];
  const [activeCategory, setActiveCategory] = React.useState<Category>('all');

  const filtered = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  function handleSelect(service: Service) {
    selectService(service);
  }

  function handleContinue() {
    if (selectedService) nextStep();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Choose a Service</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select the service you'd like to book.
        </p>
      </div>

      {/* Category Filter */}
      {!isLoading && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                activeCategory === cat
                  ? 'bg-luxe-700 text-white border-luxe-700'
                  : 'bg-background text-muted-foreground border-border hover:border-luxe-300 hover:text-luxe-700'
              )}
            >
              {categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">Failed to load services. Please refresh.</p>
      )}

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(service => (
            <Card
              key={service.id}
              onClick={() => handleSelect(service)}
              className={cn(
                'cursor-pointer transition-all duration-150 hover:shadow-md',
                selectedService?.id === service.id
                  ? 'ring-2 ring-luxe-600 border-luxe-300 bg-luxe-50'
                  : 'hover:border-luxe-200'
              )}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <Badge variant="luxe" className="text-xs">
                      {categoryLabels[service.category] ?? service.category}
                    </Badge>
                    <h3 className={cn(
                      'font-sans font-semibold text-sm leading-snug',
                      selectedService?.id === service.id ? 'text-luxe-700' : 'text-foreground'
                    )}>
                      {service.name}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-luxe-700">
                      {formatPrice(service.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(service.durationMinutes)}
                    </div>
                  </div>
                </div>
                {service.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}
                {selectedService?.id === service.id && (
                  <div className="flex items-center gap-1 text-xs font-medium text-luxe-600">
                    <span>✓</span>
                    <span>Selected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="luxe"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedService}
          className="min-w-32"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}