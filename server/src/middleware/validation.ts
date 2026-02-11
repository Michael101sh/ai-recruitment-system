import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Creates an Express middleware that validates the request body against a Zod schema.
 * Returns 400 with validation errors if the body does not match the schema.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        error: {
          message: 'Validation failed',
          details: formattedErrors,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
};
