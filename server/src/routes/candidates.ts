import { Router } from 'express';

import {
  generateCandidatesWithCVs,
  getAllCandidates,
} from '../controllers/candidateController';
import { validateBody } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { GenerateCandidatesSchema } from '../types';

const router = Router();

// GET  /api/candidates           → list all candidates (paginated)
router.get('/', getAllCandidates);

// POST /api/candidates/generate  → AI-generate candidates + CVs
//   - authenticate:  require valid API key (if configured)
//   - aiLimiter:     stricter rate limit for expensive AI calls
//   - validateBody:  ensure { count: 1–10 }
router.post(
  '/generate',
  authenticate,
  aiLimiter,
  validateBody(GenerateCandidatesSchema),
  generateCandidatesWithCVs,
);

export default router;
