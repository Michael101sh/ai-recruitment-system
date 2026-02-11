import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — protects all endpoints from brute-force or
 * accidental flooding.
 *
 * Defaults: 100 requests per 15-minute window per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { message: 'Too many requests, please try again later.' },
  },
});

/**
 * Stricter limiter for AI-powered endpoints (Claude API calls are expensive
 * and slow).
 *
 * Defaults: 20 requests per 15-minute window per IP.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many AI generation requests. Please wait before trying again.',
    },
  },
});
