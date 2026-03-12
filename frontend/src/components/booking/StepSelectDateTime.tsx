import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn, formatTime } from '@/lib/utils';
import { useAvailability } from '@/hooks/useAvailability';
import { useBookingStore } from '@/store/bookingStore';
import { addDays, format, startOfToday, isBefore, startOfDay } from 'date-fns';
import type { TimeSlot } from '../../../../shared/src/types/booking.types';

const DAYS_AHEAD = 30;

function generateDateOptions(): Date[] {
  const today = startOfToday();
  return Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i + 1));
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function StepSelectDateTime() {
  const {
    selectedService,
    selectedStaff,
    selectedDate,
    selectedSlot,
    selectDate,
    selectSlot,
    nextStep,
    prevStep,
  } = useBookingStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const allDates = generateDateOptions();
  const weekDates = allDates.slice(weekOffset * 7, weekOffset * 7 + 7);
  const totalWeeks = Math.ceil(allDates.length / 7);

  const { availability, isLoading: availabilityLoading } = useAvailability(
    selectedStaff?.id ?? null,
    selectedService?.id ?? null,
    selectedDate
  );

  const availableSlots = availability?.slots.filter(s => s.isAvailable) ?? [];

  function handleDateSelect(date: Date) {
    const formatted = format(date, 'yyyy-MM-dd');
    selectDate(formatted);
  }

  function handleSlotSelect(slot: TimeSlot) {
    selectSlot(slot);
  }

  function handleContinue() {
    if (selectedDate && selectedSlot) nextStep();
  }

  function isDateDisabled(date: Date): boolean {
    return isBefore(startOfDay(date), startOfToday());
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Choose Date & Time</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select an available date and time slot with{' '}
          <span className="font-medium text-foreground">{selectedStaff?.name}</span>.
        </p>
      </div>

      {/* ─── Date Picker ──────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Select a Date</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
              disabled={weekOffset === 0}
              className="p-1.5 rounded-md border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous week"
            >
              ‹
            </button>
            <button
              onClick={() => setWeekOffset(w => Math.min(totalWeeks - 1, w + 1))}
              disabled={weekOffset >= totalWeeks - 1}
              className="p-1.5 rounded-md border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next week"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map(date => {
            const formatted = format(date, 'yyyy-MM-dd');
            const isSelected = selectedDate === formatted;
            const isDisabled = isDateDisabled(date);

            return (
              <button
                key={formatted}
                onClick={() => !isDisabled && handleDateSelect(date)}
                disabled={isDisabled}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all border',
                  'min-h-[60px] disabled:opacity-30 disabled:cursor-not-allowed',
                  isSelected
                    ? 'bg-luxe-700 text-white border-luxe-700 ring-2 ring-luxe-200'
                    : 'bg-background hover:border-luxe-300 hover:bg-luxe-50 border-border'
                )}
              >
                <span className={cn(
                  'text-xs',
                  isSelected ? 'text-white/80' : 'text-muted-foreground'
                )}>
                  {DAY_LABELS[date.getDay()]}
                </span>
                <span className="text-sm font-semibold leading-none mt-0.5">
                  {date.getDate()}
                </span>
                <span className={cn(
                  'text-xs',
                  isSelected ? 'text-white/80' : 'text-muted-foreground'
                )}>
                  {MONTH_LABELS[date.getMonth()]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Time Slots ───────────────────────────────────────────────────────── */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Select a Time</h3>

          {availabilityLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
              No available slots for this date. Please select another day.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {availableSlots.map(slot => {
                const isSelected =
                  selectedSlot?.startTime === slot.startTime;

                return (
                  <button
                    key={slot.startTime}
                    onClick={() => handleSlotSelect(slot)}
                    className={cn(
                      'px-2 py-2 rounded-md text-xs font-medium border transition-all',
                      isSelected
                        ? 'bg-luxe-700 text-white border-luxe-700 ring-2 ring-luxe-200'
                        : 'bg-background hover:border-luxe-300 hover:bg-luxe-50 border-border text-foreground'
                    )}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Navigation ───────────────────────────────────────────────────────── */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button
          variant="luxe"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedDate || !selectedSlot}
          className="min-w-32"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}