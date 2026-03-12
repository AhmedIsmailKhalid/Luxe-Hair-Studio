import { PrismaClient, Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const developmentLogs: Prisma.LogDefinition[] = [
  { emit: 'event', level: 'query' },
  { emit: 'event', level: 'error' },
  { emit: 'event', level: 'warn' },
];

const productionLogs: Prisma.LogDefinition[] = [
  { emit: 'event', level: 'error' },
];

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? developmentLogs : productionLogs,
  });

if (env.NODE_ENV === 'development') {
  (prisma as PrismaClient<{ log: Prisma.LogDefinition[] }>).$on(
    'query' as never,
    (e: Prisma.QueryEvent) => {
      logger.debug(`Query: ${e.query} — ${e.duration}ms`);
    }
  );
}

(prisma as PrismaClient<{ log: Prisma.LogDefinition[] }>).$on(
  'error' as never,
  (e: Prisma.LogEvent) => {
    logger.error(`Prisma error: ${e.message}`);
  }
);

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}