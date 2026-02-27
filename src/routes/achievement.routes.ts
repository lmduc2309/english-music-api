import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAllAchievements, getMyAchievements, checkAchievements } from '../controllers/achievement.controller';

const router = Router();

router.get('/', authenticate, getAllAchievements);
router.get('/mine', authenticate, getMyAchievements);
router.post('/check', authenticate, checkAchievements);

export default router;
