import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import { createError } from './errorHandler.js';
import { logger } from '../lib/logger.js';

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('Missing or invalid authorization header', 401));
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn('Unauthorized access attempt', { error: error?.message });
      return next(createError('Invalid or expired token', 401));
    }

    // Attach user to request for downstream use
    req.user = {
      id: data.user.id,
      email: data.user.email ?? '',
    };

    next();
  } catch (err) {
    next(err);
  }
}