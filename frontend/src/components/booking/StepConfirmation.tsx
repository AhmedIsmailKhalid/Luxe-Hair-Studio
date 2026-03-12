import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDuration, formatDate, formatTime } from '@/lib/utils';
import { useBookingStore } from '@/store/bookingStore';
import { createBooking } from '@/lib/bookings.api';
import { getErrorMessage } from '@/lib/api';

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export function StepConfirmation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    selectedService,
    selectedStaff,
    selectedDate,
    selectedSlot,
    clientDetails,
    confirmedBookingId,
    setConfirmedBookingId,
    prevStep,
  } = useBookingStore();

  // ─── Success State ──────────────────────────────────────────────────────────
  if (confirmedBookingId) {
    return (
      <div className="text-center space-y-6 py-6">
        <div className="w-16 h-16 rounded-full bg-luxe-100 flex items-center justify-center mx-auto">
          <span className="text-3xl">✓</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-semibold text-luxe-700">
            Booking Confirmed!
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Your appointment has been booked successfully. A confirmation email
            will be sent to{' '}
            <span className="font-medium text-foreground">{clientDetails?.email}</span>.
          </p>
        </div>

        <Card className="text-left max-w-sm mx-auto">
          <CardContent className="p-5 space-y-1">
            <p className="text-xs text-muted-foreground mb-3">Booking reference</p>
            <p className="font-mono text-xs text-luxe-700 break-all">{confirmedBookingId}</p>
            <Separator className="my-3" />
            {selectedService && (
              <SummaryRow label="Service" value={selectedService.name} />
            )}
            {selectedStaff && (
              <SummaryRow label="Stylist" value={selectedStaff.name} />
            )}
            {selectedDate && (
              <SummaryRow label="Date" value={formatDate(selectedDate)} />
            )}
            {selectedSlot && (
              <SummaryRow label="Time" value={formatTime(selectedSlot.startTime)} />
            )}
            {selectedService && (
              <SummaryRow label="Total" value={formatPrice(selectedService.price)} />
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="luxe" size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/services">Browse Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Guard: ensure all data is present ─────────────────────────────────────
  if (!selectedService || !selectedStaff || !selectedDate || !selectedSlot || !clientDetails) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-muted-foreground">Something went wrong. Please start over.</p>
        <Button asChild variant="outline">
          <Link to="/book">Start Over</Link>
        </Button>
      </div>
    );
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedSlot || !clientDetails) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const booking = await createBooking({
        serviceId: selectedService.id,
        staffId: selectedStaff.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        clientName: clientDetails.name,
        clientEmail: clientDetails.email,
        clientPhone: clientDetails.phone,
        notes: clientDetails.notes,
      });
      setConfirmedBookingId(booking.id);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Review State ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Review & Confirm</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please review your booking details before confirming.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-1 divide-y divide-border">
          <div className="pb-3">
            <Badge variant="luxe" className="text-xs">Booking Summary</Badge>
          </div>

          <div className="pt-2">
            <SummaryRow label="Service" value={selectedService.name} />
            <SummaryRow
              label="Duration"
              value={formatDuration(selectedService.durationMinutes)}
            />
            <SummaryRow label="Price" value={formatPrice(selectedService.price)} />
          </div>

          <div className="pt-2">
            <SummaryRow label="Stylist" value={selectedStaff.name} />
            <SummaryRow label="Date" value={formatDate(selectedDate)} />
            <SummaryRow
              label="Time"
              value={`${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`}
            />
          </div>

          <div className="pt-2">
            <SummaryRow label="Name" value={clientDetails.name} />
            <SummaryRow label="Email" value={clientDetails.email} />
            <SummaryRow label="Phone" value={clientDetails.phone} />
            {clientDetails.notes && (
              <SummaryRow label="Notes" value={clientDetails.notes} />
            )}
          </div>

          <div className="pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-semibold text-luxe-700">
                {formatPrice(selectedService.price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {submitError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{submitError}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        By confirming, you agree to our cancellation policy. Bookings can be
        cancelled up to 24 hours in advance.
      </p>

      <div className="flex justify-between pt-2">
        <Button variant="outline" size="lg" onClick={prevStep} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          variant="luxe"
          size="lg"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="min-w-40"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );
}