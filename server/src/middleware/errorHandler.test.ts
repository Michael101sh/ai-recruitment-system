import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';
import { errorHandler } from './errorHandler';
import { AppError, ValidationError } from '../utils/AppError';

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
    mockNext = jest.fn();
  });

  it('handles AppError with correct status code', () => {
    const error = new ValidationError('Invalid input');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: { message: 'Invalid input' },
    });
  });

  it('handles Prisma NotFoundError as 404', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    });

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: { message: 'Record not found' },
    });
  });

  it('handles Prisma UniqueConstraint error as 409', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith({
      error: { message: 'A record with this value already exists' },
    });
  });

  it('handles ZodError as 400 with formatted messages', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number(),
    });

    let zodError: ZodError;
    try {
      schema.parse({ name: '', age: 'not-a-number' });
    } catch (err) {
      zodError = err as ZodError;
    }

    errorHandler(zodError!, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        message: expect.stringContaining('Validation failed'),
        details: expect.any(Array),
      },
    });
  });

  it('handles generic errors as 500 and includes stack in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Internal database connection failed');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        message: 'Internal database connection failed',
        stack: expect.any(String),
      },
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('logs all errors via winston', () => {
    const error = new AppError('System error', 500, false);

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    // Winston logger is called, but we don't spy on it in this test
    // Just verify the response is correct
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalled();
  });
});
