import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import { CreateServiceSchema, UpdateServiceSchema } from 'shared/schemas/service.schema.js';

export async function getAllServices(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.json({ data: services });
  } catch (err) {
    next(err);
  }
}

export async function getServiceById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!service) {
      return next(createError('Service not found', 404));
    }

    res.json({ data: service });
  } catch (err) {
    next(err);
  }
}

export async function createService(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = CreateServiceSchema.parse(req.body);

    const service = await prisma.service.create({
      data: {
        ...validated,
        price: validated.price,
      },
    });

    res.status(201).json({ data: service, message: 'Service created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateService(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = UpdateServiceSchema.parse(req.body);

    const existing = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return next(createError('Service not found', 404));
    }

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: validated,
    });

    res.json({ data: service, message: 'Service updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existing) {
      return next(createError('Service not found', 404));
    }

    if (existing._count.bookings > 0) {
      // Has booking history — soft delete to preserve data integrity
      await prisma.service.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });
    } else {
      // No bookings — safe to hard delete, clean up related records first
      await prisma.$transaction([
        prisma.staffService.deleteMany({ where: { serviceId: req.params.id } }),
        prisma.service.delete({ where: { id: req.params.id } }),
      ]);
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    next(err);
  }
}