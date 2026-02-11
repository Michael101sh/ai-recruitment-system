import { PrismaClient } from '@prisma/client';

import { logger } from '../utils/logger';

// Singleton Prisma client instance to prevent multiple connections
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

prisma.$connect()
  .then(() => logger.info('Connected to PostgreSQL database'))
  .catch((error: unknown) => {
    logger.error('Failed to connect to database', error);
    process.exit(1);
  });

export { prisma };
