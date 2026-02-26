import { Router } from 'express';
import { getGlobalLeaderboard, getLevelLeaderboard, getUserRank } from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getGlobalLeaderboard);
router.get('/level/:level', authenticate, getLevelLeaderboard);
router.get('/me', authenticate, getUserRank);

export default router;
