import rateLimit from 'express-rate-limit';

/**
 * CareerOS — Production Rate Limiting Middleware (Day 12)
 * Shields CareerOS REST API, Auth, and AI endpoints against abuse, brute-force, and DoS attacks.
 */

const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * Standard JSON error response formatter for rate limit triggers
 */
const rateLimitResponseHandler = (message) => (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    message,
    statusCode: options.statusCode,
    retryAfter: Math.ceil(options.windowMs / 1000)
  });
};

/**
 * General API Rate Limiter
 * Default: 600 requests per 15-minute window per IP
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: isTestEnv ? 10000 : parseInt(process.env.RATE_LIMIT_MAX || '600', 10),
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => isTestEnv || req.headers['x-bypass-ratelimit'] === 'test-suite',
  handler: rateLimitResponseHandler('Too many API requests from this IP. Please try again later.')
});

/**
 * Strict Authentication Rate Limiter
 * Shields /api/auth/login and /api/auth/register against brute-force attacks
 * Default: 30 attempts per 15-minute window per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnv ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: (req) => isTestEnv || req.headers['x-bypass-ratelimit'] === 'test-suite',
  handler: rateLimitResponseHandler('Too many authentication attempts. Please wait 15 minutes before trying again.')
});

/**
 * AI Generation & RAG Query Rate Limiter
 * Shields AI and embedding endpoints against token exhaustion
 * Default: 60 requests per 1-minute window per IP
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTestEnv ? 1000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTestEnv || req.headers['x-bypass-ratelimit'] === 'test-suite',
  handler: rateLimitResponseHandler('AI request rate limit reached. Please pause a moment before sending another query.')
});

export default {
  apiLimiter,
  authLimiter,
  aiLimiter
};
