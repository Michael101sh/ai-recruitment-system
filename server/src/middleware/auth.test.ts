import type { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth';
import { AppError } from '../utils/AppError';

describe('authenticate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  const originalEnv = process.env.API_KEY;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      ip: '127.0.0.1',
      path: '/api/test',
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env.API_KEY = originalEnv;
  });

  it('calls next() when API_KEY is not configured', () => {
    delete process.env.API_KEY;

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('calls next() when API_KEY matches', () => {
    process.env.API_KEY = 'secret-key';
    mockRequest.headers = { 'x-api-key': 'secret-key' };

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('calls next with AppError when API_KEY is missing from request', () => {
    process.env.API_KEY = 'secret-key';
    mockRequest.headers = {};

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Invalid or missing API key');
    expect(error.statusCode).toBe(401);
  });

  it('calls next with AppError when API_KEY is incorrect', () => {
    process.env.API_KEY = 'secret-key';
    mockRequest.headers = { 'x-api-key': 'wrong-key' };

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Invalid or missing API key');
    expect(error.statusCode).toBe(401);
  });

  it('handles x-api-key as string (takes first element of array)', () => {
    process.env.API_KEY = 'secret-key';
    mockRequest.headers = { 'x-api-key': 'secret-key' as any };

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });
});
