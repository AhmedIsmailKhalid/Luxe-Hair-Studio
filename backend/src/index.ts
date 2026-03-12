import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { disconnectPrisma } from './lib/prisma.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import servicesRouter from './routes/services.route.js';
import staffRouter from './routes/staff.route.js';
import availabilityRouter from './routes/availability.route.js';
import bookingsRouter from './routes/bookings.route.js';
import { requireAuth } from './middleware/auth.js';
import { apiLimiter, bookingLimiter } from './middleware/rateLimiter.js';


const app = express();

// ─── Security & Parsing Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes  ──────────────────────────────────────────────────────────────
app.use('/api/services', apiLimiter, servicesRouter);
app.use('/api/staff', apiLimiter, staffRouter);
app.use('/api/availability', apiLimiter, availabilityRouter);
app.use('/api/bookings', apiLimiter, bookingLimiter, bookingsRouter);

// ─── Admin Routes (protected) ─────────────────────────────────────────────────
app.use('/api/admin/bookings', requireAuth, bookingsRouter);
app.use('/api/admin/services', requireAuth, servicesRouter);
app.use('/api/admin/staff', requireAuth, staffRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Startup ───────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await disconnectPrisma();
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;