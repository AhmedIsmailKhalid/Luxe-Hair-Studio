import { useBookingStore } from '@/store/bookingStore';
import { formatPrice, formatDuration, formatDate, formatTime } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function BookingSummaryBar() {
  const { selectedService, selectedStaff, selectedDate, selectedSlot } = useBookingStore();

  if (!selectedService) return null;

  return (
    <div className="bg-luxe-50 border border-luxe-100 rounded-lg p-4 space-y-2">
      <p className="text-xs font-semibold text-luxe-700 uppercase tracking-wide">
        Your Selection
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="font-medium text-foreground">{selectedService.name}</span>
        {selectedStaff && (
          <>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span className="text-muted-foreground">with {selectedStaff.name}</span>
          </>
        )}
        {selectedDate && selectedSlot && (
          <>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span className="text-muted-foreground">
              {formatDate(selectedDate)} at {formatTime(selectedSlot.startTime)}
            </span>
          </>
        )}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{formatPrice(selectedService.price)}</span>
        <span>·</span>
        <span>{formatDuration(selectedService.durationMinutes)}</span>
      </div>
    </div>
  );
}