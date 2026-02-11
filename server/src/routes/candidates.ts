import { Router } from 'express';

import { createCandidate, getAllCandidates, getCandidateById } from '../controllers/candidateController';
import { validateBody } from '../middleware/validation';
import { CandidateSchema } from '../types';

const router = Router();

router.post('/', validateBody(CandidateSchema), createCandidate);
router.get('/', getAllCandidates);
router.get('/:id', getCandidateById);

export default router;
