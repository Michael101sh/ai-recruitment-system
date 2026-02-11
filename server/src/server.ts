import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import candidateRoutes from './routes/candidates';
import rankingRoutes from './routes/rankings';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/rankings', rankingRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler (must be registered last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

export default app;
