import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  price: z.number().positive(),
  category: z.enum(['haircut', 'color', 'treatment', 'styling', 'other']),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
});

export const CreateServiceSchema = ServiceSchema.omit({
  id: true,
});

export const UpdateServiceSchema = CreateServiceSchema.partial();

export type Service = z.infer<typeof ServiceSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;