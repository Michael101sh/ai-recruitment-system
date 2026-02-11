import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Centralised error-handling middleware.
 *
 * Catches every error that passes through `next(err)` and returns a
 * **consistent** JSON envelope with the appropriate HTTP status code:
 *
 * - `AppError`                  → uses the error's own `statusCode`
 * - `ZodError`                  → 400  (validation failure)
 * - `PrismaClientKnownRequest`  → 409  (unique constraint) or 404 (not found)
 * - Everything else             → 500  (unexpected / programming error)
 *
 * Stack traces are **only** included in `development`.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ── Log ──────────────────────────────────────────────────────────
  logger.error(err.message, { stack: err.stack });

  // ── Custom application errors ────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
    return;
  }

  // ── Zod validation errors ────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // ── Prisma known-request errors ──────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint
        res.status(409).json({
          error: { message: 'A record with this value already exists' },
        });
        return;
      case 'P2025': // Record not found
        res.status(404).json({
          error: { message: 'Record not found' },
        });
        return;
      default:
        break; // fall through to generic handler
    }
  }

  // ── Unhandled / programming errors ───────────────────────────────
  res.status(500).json({
    error: {
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal Server Error'
          : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
