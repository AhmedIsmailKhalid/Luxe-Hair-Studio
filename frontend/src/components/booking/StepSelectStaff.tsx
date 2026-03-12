import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, getInitials } from '@/lib/utils';
import { useStaffForService } from '@/hooks/useStaff';
import { useBookingStore } from '@/store/bookingStore';
import type { StaffWithServices } from '@/lib/staff.api';

interface StepSelectStaffProps {
  preSelectedStaffId: string | null;
}

export function StepSelectStaff({ preSelectedStaffId }: StepSelectStaffProps) {
  const { selectedService, selectedStaff, selectStaff, nextStep, prevStep } = useBookingStore();
  const { staff, isLoading, error } = useStaffForService(selectedService?.id ?? null);

  // Auto-select if coming from Team page with a staffId param
  useEffect(() => {
    if (preSelectedStaffId && staff.length > 0 && !selectedStaff) {
      const match = staff.find(m => m.id === preSelectedStaffId);
      if (match) selectStaff(match);
    }
  }, [preSelectedStaffId, staff, selectedStaff, selectStaff]);

  function handleSelect(member: StaffWithServices) {
    selectStaff(member);
  }

  function handleContinue() {
    if (selectedStaff) nextStep();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Choose Your Stylist</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a stylist for your{' '}
          <span className="font-medium text-foreground">{selectedService?.name}</span>.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">Failed to load stylists. Please refresh.</p>
      )}

      {/* Staff List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(member => (
            <Card
              key={member.id}
              onClick={() => handleSelect(member)}
              className={cn(
                'cursor-pointer transition-all duration-150 hover:shadow-md',
                selectedStaff?.id === member.id
                  ? 'ring-2 ring-luxe-600 border-luxe-300 bg-luxe-50'
                  : 'hover:border-luxe-200'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                    selectedStaff?.id === member.id
                      ? 'bg-luxe-600 text-white'
                      : 'bg-luxe-100 text-luxe-700'
                  )}>
                    <span className="font-semibold text-sm font-serif">
                      {getInitials(member.name)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        'font-sans font-semibold text-sm',
                        selectedStaff?.id === member.id ? 'text-luxe-700' : 'text-foreground'
                      )}>
                        {member.name}
                      </h3>
                      {selectedStaff?.id === member.id && (
                        <span className="text-xs font-medium text-luxe-600">✓ Selected</span>
                      )}
                    </div>
                    {member.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    {member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {member.specialties.slice(0, 3).map(s => (
                          <Badge key={s} variant="luxe" className="text-xs py-0">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {staff.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No stylists available for this service.
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button
          variant="luxe"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedStaff}
          className="min-w-32"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}