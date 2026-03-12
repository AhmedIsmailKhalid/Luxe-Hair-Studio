import { z } from 'zod';

export const StaffSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Staff name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  specialties: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const CreateStaffSchema = StaffSchema.omit({
  id: true,
});

export const UpdateStaffSchema = CreateStaffSchema.partial();

export type Staff = z.infer<typeof StaffSchema>;
export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;