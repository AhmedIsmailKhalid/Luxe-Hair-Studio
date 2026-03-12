import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  logger.info('Seeding database...');

  // ─── Clean existing data ────────────────────────────────────────────────────
  await prisma.booking.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.staffAvailability.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.service.deleteMany();

  // ─── Services ───────────────────────────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Classic Haircut',
        description: 'Precision cut tailored to your face shape and style preferences.',
        durationMinutes: 45,
        price: 65,
        category: 'haircut',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Wash, Cut & Blow Dry',
        description: 'Full service including shampoo, conditioning treatment, cut and blow dry finish.',
        durationMinutes: 75,
        price: 95,
        category: 'haircut',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Full Colour',
        description: 'Single process colour application from roots to ends. Includes toner.',
        durationMinutes: 120,
        price: 145,
        category: 'color',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Balayage & Highlights',
        description: 'Hand-painted balayage or foil highlights for a natural, sun-kissed finish.',
        durationMinutes: 180,
        price: 220,
        category: 'color',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Keratin Treatment',
        description: 'Smoothing treatment that eliminates frizz and reduces styling time for up to 3 months.',
        durationMinutes: 150,
        price: 280,
        category: 'treatment',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Deep Conditioning Treatment',
        description: 'Intensive moisture and repair treatment for damaged or dry hair.',
        durationMinutes: 45,
        price: 55,
        category: 'treatment',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Blowout & Style',
        description: 'Professional blowout with styling. Perfect for special occasions.',
        durationMinutes: 60,
        price: 75,
        category: 'styling',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Bridal Updo',
        description: 'Elegant updo styling for weddings and formal events. Includes trial consultation.',
        durationMinutes: 90,
        price: 165,
        category: 'styling',
        isActive: true,
      },
    }),
  ]);

  logger.info(`Created ${services.length} services`);

  // ─── Staff ───────────────────────────────────────────────────────────────────
  const sophia = await prisma.staff.create({
    data: {
      name: 'Sophia Laurent',
      email: 'sophia@luxehairstudio.com',
      phone: '+1 (555) 101-2020',
      bio: 'Senior stylist with 12 years of experience specialising in colour transformations and precision cuts. Trained in Paris and London.',
      specialties: ['Balayage', 'Colour Correction', 'Precision Cuts'],
      isActive: true,
    },
  });

  const marcus = await prisma.staff.create({
    data: {
      name: 'Marcus Reid',
      email: 'marcus@luxehairstudio.com',
      phone: '+1 (555) 303-4040',
      bio: 'Creative stylist specialising in textured hair, keratin treatments and bridal styling. Known for his attention to detail and relaxed chair-side manner.',
      specialties: ['Textured Hair', 'Keratin Treatments', 'Bridal Styling'],
      isActive: true,
    },
  });

  logger.info(`Created 2 staff members`);

  // ─── Staff Availability (Mon–Sat) ────────────────────────────────────────────
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const sophiaAvailability = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '10:00', endTime: '19:00' }, // Thursday
    { dayOfWeek: 5, startTime: '10:00', endTime: '19:00' }, // Friday
    { dayOfWeek: 6, startTime: '09:00', endTime: '16:00' }, // Saturday
  ];

  const marcusAvailability = [
    { dayOfWeek: 2, startTime: '10:00', endTime: '19:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '10:00', endTime: '19:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' }, // Friday
    { dayOfWeek: 6, startTime: '10:00', endTime: '17:00' }, // Saturday
  ];

  await Promise.all([
    ...sophiaAvailability.map(a =>
      prisma.staffAvailability.create({
        data: { staffId: sophia.id, ...a, isAvailable: true },
      })
    ),
    ...marcusAvailability.map(a =>
      prisma.staffAvailability.create({
        data: { staffId: marcus.id, ...a, isAvailable: true },
      })
    ),
  ]);

  logger.info(`Created availability schedules`);

  // ─── Staff Service Assignments ───────────────────────────────────────────────
  // Sophia: all services
  // Marcus: all except Balayage & Bridal Updo
  const sophiaServices = services;
  const marcusServices = services.filter(
    s => !['Balayage & Highlights', 'Bridal Updo'].includes(s.name)
  );

  await Promise.all([
    ...sophiaServices.map(s =>
      prisma.staffService.create({
        data: { staffId: sophia.id, serviceId: s.id },
      })
    ),
    ...marcusServices.map(s =>
      prisma.staffService.create({
        data: { staffId: marcus.id, serviceId: s.id },
      })
    ),
  ]);

  logger.info(`Created staff-service assignments`);
  logger.info('Seeding complete ✓');
}

main()
  .catch(err => {
    logger.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });