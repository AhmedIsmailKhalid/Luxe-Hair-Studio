import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import { CreateStaffSchema, UpdateStaffSchema } from 'shared/schemas/staff.schema.js';

export async function getAllStaff(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const staff = await prisma.staff.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        staffServices: {
          include: { service: true },
        },
      },
    });
    res.json({ data: staff });
  } catch (err) {
    next(err);
  }
}

export async function getStaffById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: req.params.id },
      include: {
        staffServices: {
          include: { service: true },
        },
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!staff) {
      return next(createError('Staff member not found', 404));
    }

    res.json({ data: staff });
  } catch (err) {
    next(err);
  }
}

export async function createStaff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = CreateStaffSchema.parse(req.body);

    const existing = await prisma.staff.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return next(createError('A staff member with this email already exists', 409));
    }

    const staff = await prisma.staff.create({ data: validated });

    res.status(201).json({ data: staff, message: 'Staff member created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateStaff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = UpdateStaffSchema.parse(req.body);

    const existing = await prisma.staff.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return next(createError('Staff member not found', 404));
    }

    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: validated,
    });

    res.json({ data: staff, message: 'Staff member updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteStaff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await prisma.staff.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existing) {
      return next(createError('Staff member not found', 404));
    }

    if (existing._count.bookings > 0) {
      // Has booking history — soft delete to preserve data integrity
      await prisma.staff.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });
    } else {
      // No bookings — safe to hard delete, clean up related records first
      await prisma.$transaction([
        prisma.staffAvailability.deleteMany({ where: { staffId: req.params.id } }),
        prisma.staffService.deleteMany({ where: { staffId: req.params.id } }),
        prisma.staff.delete({ where: { id: req.params.id } }),
      ]);
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function upsertAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;

    const availability = await prisma.staffAvailability.upsert({
      where: {
        staffId_dayOfWeek: {
          staffId: req.params.id,
          dayOfWeek,
        },
      },
      update: { startTime, endTime, isAvailable },
      create: {
        staffId: req.params.id,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
      },
    });

    res.json({ data: availability });
  } catch (err) {
    next(err);
  }
}

export async function updateStaffServices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { serviceIds } = req.body as { serviceIds: string[] };
    const staffId = req.params.id;

    // Delete all existing assignments then recreate
    await prisma.staffService.deleteMany({ where: { staffId } });

    if (serviceIds.length > 0) {
      await prisma.staffService.createMany({
        data: serviceIds.map(serviceId => ({ staffId, serviceId })),
      });
    }

    res.json({ message: 'Staff services updated successfully' });
  } catch (err) {
    next(err);
  }
}