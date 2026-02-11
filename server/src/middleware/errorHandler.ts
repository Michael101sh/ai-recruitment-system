import type { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import type { ApiErrorResponse } from '../types';

/**
 * Global error handling middleware for Express
 * Captures all errors passed via next() and returns a standardized error response
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`Unhandled error: ${err.message}`, err.stack);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  const errorResponse: ApiErrorResponse = {
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(errorResponse);
};
