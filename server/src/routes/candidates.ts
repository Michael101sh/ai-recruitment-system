import { Router } from 'express';

import { generateCandidatesWithCVs, getAllCandidates } from '../controllers/candidateController';
import { validateBody } from '../middleware/validation';
import { GenerateCandidatesSchema } from '../types';

const router = Router();

router.post('/generate', validateBody(GenerateCandidatesSchema), generateCandidatesWithCVs);
router.get('/', getAllCandidates);

export default router;
