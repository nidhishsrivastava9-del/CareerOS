import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Production Security & Rate Limiting Middleware (Day 12)
import { configureSecurityHeaders, getCorsOptions } from './middleware/securityMiddleware.js';
import { apiLimiter, authLimiter, aiLimiter } from './middleware/rateLimitMiddleware.js';

// Import modular API route handlers
import authRouter from './routes/auth.js';
import skillsRouter from './routes/skills.js';
import projectsRouter from './routes/projects.js';
import goalsRouter from './routes/goals.js';
import dsaRouter from './routes/dsa.js';
import seedRouter from './routes/seed.js';
import careersRouter from './routes/careers.js';
import progressRouter from './routes/progress.js';
import resourcesRouter from './routes/resources.js';
import aiRouter from './routes/ai.js';
import assessmentsRouter, { ensureAssessmentsSeeded } from './routes/assessments.js';

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Nginx / Docker) for accurate rate limiting and client IP detection
app.set('trust proxy', 1);

// Production Security Headers via Helmet (Day 12)
app.use(configureSecurityHeaders());

// Hardened CORS
app.use(cors(getCorsOptions()));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Request logger for debugging and development visibility
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CareerOS REST API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    documentation: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      skills: 'GET, POST, PUT, DELETE /api/skills',
      projects: 'GET, POST, PUT, DELETE /api/projects',
      goals: 'GET, POST, PUT, DELETE /api/goals',
      dsa: 'GET, PUT /api/dsa',
      careers: 'GET /api/careers',
      assessments: 'GET, POST /api/assessments',
      ai: 'POST /api/ai/chat'
    }
  });
});

// Health check endpoint (exempt from rate limits)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: 'CareerOS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState
    }
  });
});

// Apply Rate Limiters (Day 12)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai/chat', aiLimiter);
app.use('/api/ai/quick-action', aiLimiter);
app.use('/api', apiLimiter);

// Mount modular API routes
app.use('/api/auth', authRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/dsa', dsaRouter);
app.use('/api/seed', seedRouter);
app.use('/api/careers', careersRouter);
app.use('/api/progress', progressRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/assessments', assessmentsRouter);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[CareerOS Server Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Express server
const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`  CareerOS API Server listening on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Security: Helmet CSP & CORS Hardened (Day 12)`);
  console.log(`  Rate Limiting: Active on Auth, AI & API routes`);
  console.log(`===============================================`);

  // Initialize Knowledge Base RAG index if unprimed
  setTimeout(async () => {
    try {
      const KnowledgeChunk = (await import('./models/KnowledgeChunk.js')).default;
      const Resource = (await import('./models/Resource.js')).default;
      const { RESOURCES_SEED } = await import('./data/resourcesSeedData.js');
      const { reindexAll } = await import('./services/indexingService.js');

      if (mongoose.connection.readyState === 1) {
        const resCount = await Resource.countDocuments();
        if (resCount === 0) {
          console.log('[CareerOS Startup]: Seeding initial learning resources...');
          await Resource.insertMany(RESOURCES_SEED);
        }
        const chunkCount = await KnowledgeChunk.countDocuments({ status: 'published' });
        if (chunkCount === 0) {
          console.log('[CareerOS Startup]: Priming Knowledge Base RAG index...');
          const result = await reindexAll();
          console.log(`[CareerOS Startup]: RAG index primed with ${result.totalChunksIndexed} chunks across ${result.totalResourcesFound} resources.`);
        }
      } else {
        const { memoryKnowledgeChunks } = await import('./data/store.js');
        if (memoryKnowledgeChunks.length === 0) {
          await reindexAll();
        }
      }
      // Also ensure Day 11 Assessments and Question Bank are primed
      await ensureAssessmentsSeeded();
    } catch (err) {
      console.warn('[CareerOS Startup]: Knowledge index priming note:', err.message);
    }
  }, 1000);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[CareerOS Server]: Port ${PORT} already in use. Continuing...`);
  } else {
    console.error('[CareerOS Server Error]:', err);
  }
});

export default app;

