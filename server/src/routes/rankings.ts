import { Router } from 'express';

import { rankAllCandidates, getRankings, getInterviewList } from '../controllers/rankingController';

const router = Router();

router.post('/', rankAllCandidates);
router.get('/', getRankings);
router.get('/interview-list', getInterviewList);

export default router;
