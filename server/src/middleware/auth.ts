import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * API-key authentication middleware.
 *
 * When `API_KEY` is set in the environment the client **must** send a
 * matching `x-api-key` header.  When `API_KEY` is **not** set authentication
 * is skipped – this keeps the development experience friction-free.
 *
 * > For a production deployment this should be replaced (or extended) with
 * > JWT-based authentication and proper RBAC.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const serverApiKey = process.env.API_KEY;

  // No key configured → development mode, skip auth
  if (!serverApiKey) {
    return next();
  }

  const clientApiKey = req.headers['x-api-key'] as string | undefined;

  if (!clientApiKey || clientApiKey !== serverApiKey) {
    logger.warn('Authentication failed: invalid or missing API key', {
      ip: req.ip,
      path: req.path,
    });
    return next(new AppError('Invalid or missing API key', 401));
  }

  next();
};
