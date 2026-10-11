import helmet from 'helmet';

/**
 * CareerOS — Production Security Headers Middleware (Day 12)
 * Configures Helmet with a Content Security Policy (CSP) tailored for CareerOS,
 * enabling secure iframe embeds for YouTube and external educational resources.
 */
export const configureSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'https://img.youtube.com', 'https://i.ytimg.com'],
        frameSrc: [
          "'self'",
          'https://www.youtube.com',
          'https://www.youtube-nocookie.com',
          'https://player.vimeo.com'
        ],
        connectSrc: [
          "'self'",
          'http://localhost:5000',
          'http://127.0.0.1:5000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https:'
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false, // Required for third-party embeds (YouTube)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'sameorigin' },
    hidePoweredBy: true,
    hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  });
};

/**
 * Production-hardened CORS options generator
 */
export const getCorsOptions = () => {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:80',
    'http://localhost'
  ];

  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [];

  const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

  return {
    origin: (origin, callback) => {
      // Allow non-browser callers (curl, server-to-server, postman) where origin is undefined
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CareerOS CORS policy`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: true,
    maxAge: 86400 // Cache preflight requests for 24 hours
  };
};

export default {
  configureSecurityHeaders,
  getCorsOptions
};
