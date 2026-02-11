import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import candidateRoutes from './routes/candidates';
import rankingRoutes from './routes/rankings';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security ──────────────────────────────────────────────────────────
// Helmet sets various HTTP headers to help protect the app.
app.use(helmet());

// CORS — explicitly allow only the client origin.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

// ── Body Parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Request Logging ───────────────────────────────────────────────────
// Morgan streams HTTP request logs through Winston so they share the
// same structured format and transport.
app.use(
  morgan('short', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);

// ── Rate Limiting ─────────────────────────────────────────────────────
// General limiter for all API routes (per-endpoint AI limiters are added
// inside the route files).
app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/candidates', candidateRoutes);
app.use('/api/rankings', rankingRoutes);

// ── Health Check ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Global Error Handler (must be registered last) ────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

export default app;
