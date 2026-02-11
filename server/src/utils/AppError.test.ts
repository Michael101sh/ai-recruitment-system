import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from './AppError';

describe('AppError', () => {
  it('creates error with custom message and status code', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('defaults to 500 status code', () => {
    const error = new AppError('Server error');

    expect(error.statusCode).toBe(500);
  });

  it('can mark error as non-operational', () => {
    const error = new AppError('Programming error', 500, false);

    expect(error.isOperational).toBe(false);
  });

  it('is instance of Error', () => {
    const error = new AppError('Test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('creates 404 error with default message', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });

  it('creates 404 error with custom resource name', () => {
    const error = new NotFoundError('Candidate');

    expect(error.message).toBe('Candidate not found');
    expect(error.statusCode).toBe(404);
  });
});

describe('ValidationError', () => {
  it('creates 400 error with default message', () => {
    const error = new ValidationError();

    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(400);
  });

  it('creates 400 error with custom message', () => {
    const error = new ValidationError('Invalid email format');

    expect(error.message).toBe('Invalid email format');
    expect(error.statusCode).toBe(400);
  });
});

describe('UnauthorizedError', () => {
  it('creates 401 error', () => {
    const error = new UnauthorizedError();

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('accepts custom message', () => {
    const error = new UnauthorizedError('Invalid token');

    expect(error.message).toBe('Invalid token');
  });
});

describe('ForbiddenError', () => {
  it('creates 403 error', () => {
    const error = new ForbiddenError();

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });
});

describe('ConflictError', () => {
  it('creates 409 error', () => {
    const error = new ConflictError();

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Resource already exists');
  });

  it('accepts custom message', () => {
    const error = new ConflictError('Email already registered');

    expect(error.message).toBe('Email already registered');
  });
});
