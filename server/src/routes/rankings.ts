import { Router } from 'express';

import {
  rankAllCandidates,
  getRankings,
  getInterviewList,
} from '../controllers/rankingController';
import { validateBody } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { RankCandidatesSchema } from '../types';

const router = Router();

// GET  /api/rankings                → all rankings (paginated)
router.get('/', getRankings);

// GET  /api/rankings/interview-list → split into should / should-not
router.get('/interview-list', getInterviewList);

// POST /api/rankings               → run AI ranking on all candidates
//   - authenticate:  require valid API key (if configured)
//   - aiLimiter:     stricter rate limit for expensive AI calls
//   - validateBody:  validate optional { criteria: string }
router.post(
  '/',
  authenticate,
  aiLimiter,
  validateBody(RankCandidatesSchema),
  rankAllCandidates,
);

export default router;
