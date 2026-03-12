import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookingStore } from '@/store/bookingStore';
import { BookingStepIndicator } from '@/components/booking/BookingStepIndicator';
import { BookingSummaryBar } from '@/components/booking/BookingSummaryBar';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/common/SEO';

// Step components
import { StepSelectService } from '@/components/booking/StepSelectService';
import { StepSelectStaff } from '@/components/booking/StepSelectStaff';
import { StepSelectDateTime } from '@/components/booking/StepSelectDateTime';
import { StepClientDetails } from '@/components/booking/StepClientDetails';
import { StepConfirmation } from '@/components/booking/StepConfirmation';

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const { currentStep, reset } = useBookingStore();

  // Reset wizard on mount
  useEffect(() => {
    reset();
  }, [reset]);

  // Pre-select service or staff from URL params (coming from Services/Team pages)
  const preSelectedServiceId = searchParams.get('serviceId');
  const preSelectedStaffId = searchParams.get('staffId');

  return (
    <div className="py-10">
      <SEO
        title="Book an Appointment"
        description="Book your appointment at Luxe Hair Studio in minutes. Choose your service, your stylist, and your preferred time. Instant confirmation."
        canonical="/book"
      />
      <div className="container max-w-3xl space-y-8">
        {/* ─── Header ───────────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <Badge variant="luxe">Book Appointment</Badge>
          <h1 className="text-3xl font-serif font-semibold">
            Book Your Appointment
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete the steps below to secure your booking.
          </p>
        </div>

        {/* ─── Step Indicator ───────────────────────────────────────────────── */}
        <BookingStepIndicator currentStep={currentStep} />

        {/* ─── Summary Bar (steps 2+) ───────────────────────────────────────── */}
        {currentStep > 1 && <BookingSummaryBar />}

        {/* ─── Step Content ─────────────────────────────────────────────────── */}
        <div className="animate-fade-in">
          {currentStep === 1 && (
            <StepSelectService preSelectedServiceId={preSelectedServiceId} />
          )}
          {currentStep === 2 && (
            <StepSelectStaff preSelectedStaffId={preSelectedStaffId} />
          )}
          {currentStep === 3 && <StepSelectDateTime />}
          {currentStep === 4 && <StepClientDetails />}
          {currentStep === 5 && <StepConfirmation />}
        </div>
      </div>
    </div>
  );
}