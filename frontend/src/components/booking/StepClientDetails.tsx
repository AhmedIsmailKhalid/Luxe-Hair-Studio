import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/store/bookingStore';

const ClientDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type ClientDetailsForm = z.infer<typeof ClientDetailsSchema>;

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function StepClientDetails() {
  const { clientDetails, setClientDetails, nextStep, prevStep } = useBookingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientDetailsForm>({
    resolver: zodResolver(ClientDetailsSchema),
    defaultValues: {
      name: clientDetails?.name ?? '',
      email: clientDetails?.email ?? '',
      phone: clientDetails?.phone ?? '',
      notes: clientDetails?.notes ?? '',
    },
  });

  function onSubmit(data: ClientDetailsForm) {
    setClientDetails(data);
    nextStep();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Your Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your contact information to complete the booking.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Full Name" error={errors.name?.message} required>
          <Input
            {...register('name')}
            placeholder="Jane Smith"
            className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
          />
        </FormField>

        <FormField label="Email Address" error={errors.email?.message} required>
          <Input
            {...register('email')}
            type="email"
            placeholder="jane@example.com"
            className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
          />
        </FormField>

        <FormField label="Phone Number" error={errors.phone?.message} required>
          <Input
            {...register('phone')}
            type="tel"
            placeholder="+1 (555) 000-0000"
            className={cn(errors.phone && 'border-destructive focus-visible:ring-destructive')}
          />
        </FormField>

        <FormField label="Notes (optional)" error={errors.notes?.message}>
          <textarea
            {...register('notes')}
            placeholder="Any specific requests or information for your stylist..."
            rows={3}
            className={cn(
              'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background placeholder:text-muted-foreground resize-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.notes && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        </FormField>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" size="lg" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit" variant="luxe" size="lg" className="min-w-32">
            Review Booking
          </Button>
        </div>
      </form>
    </div>
  );
}