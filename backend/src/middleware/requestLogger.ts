import morgan from 'morgan';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export const requestLogger = morgan(
  env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream }
);