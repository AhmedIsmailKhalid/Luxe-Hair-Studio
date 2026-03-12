import { cn } from '@/lib/utils';
import type { BookingStep } from '@/store/bookingStore';

interface Step {
  number: BookingStep;
  label: string;
}

const steps: Step[] = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Stylist' },
  { number: 3, label: 'Date & Time' },
  { number: 4, label: 'Your Details' },
  { number: 5, label: 'Confirm' },
];

interface BookingStepIndicatorProps {
  currentStep: BookingStep;
}

export function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  currentStep === step.number
                    ? 'bg-luxe-700 text-white ring-4 ring-luxe-100'
                    : currentStep > step.number
                    ? 'bg-luxe-600 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  currentStep === step.number
                    ? 'text-luxe-700'
                    : currentStep > step.number
                    ? 'text-luxe-600'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 mx-2 mb-5 transition-colors',
                  currentStep > step.number ? 'bg-luxe-600' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-center justify-between px-1">
        <span className="text-sm font-medium text-luxe-700">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {steps[currentStep - 1].label}
        </span>
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-luxe-600 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}