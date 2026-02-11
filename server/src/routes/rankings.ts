import { Router } from 'express';

import { rankAllCandidates, getAllRankings } from '../controllers/rankingController';
import { validateBody } from '../middleware/validation';
import { RankCandidatesSchema } from '../types';

const router = Router();

router.post('/', validateBody(RankCandidatesSchema), rankAllCandidates);
router.get('/', getAllRankings);

export default router;
