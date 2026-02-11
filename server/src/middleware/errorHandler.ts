import type { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handling middleware for Express.
 * Logs the error and returns a standardized error response with status 500.
 * Stack trace is only included in development.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);

  res.status(500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
