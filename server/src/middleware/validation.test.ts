import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateBody } from './validation';

describe('validateBody middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();

    mockRequest = { body: {} };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  const TestSchema = z.object({
    name: z.string().min(1),
    count: z.number().int().min(1).max(10),
  });

  it('calls next() when validation passes', () => {
    mockRequest.body = { name: 'Test', count: 5 };

    const middleware = validateBody(TestSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('returns 400 with validation errors when validation fails', () => {
    mockRequest.body = { name: '', count: 15 };

    const middleware = validateBody(TestSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        message: 'Validation failed',
        details: expect.any(Array),
      },
    });
  });

  it('includes validation error details', () => {
    mockRequest.body = { name: '', count: -1 };

    const middleware = validateBody(TestSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockJson).toHaveBeenCalledWith({
      error: {
        message: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      },
    });
  });

  it('handles missing body', () => {
    mockRequest.body = undefined;

    const middleware = validateBody(TestSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
  });

  it('does not transform data without coerce', () => {
    mockRequest.body = { name: 'Test', count: '5' };

    const middleware = validateBody(TestSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Without z.coerce, string '5' will fail number validation
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        message: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'count',
            message: expect.stringContaining('number'),
          }),
        ]),
      },
    });
  });
});
