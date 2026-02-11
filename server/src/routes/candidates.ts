import { Router } from 'express';

import { createCandidateWithCV, getAllCandidates } from '../controllers/candidateController';
import { validateBody } from '../middleware/validation';
import { CandidateSchema } from '../types';

const router = Router();

router.post('/', validateBody(CandidateSchema), createCandidateWithCV);
router.get('/', getAllCandidates);

export default router;
