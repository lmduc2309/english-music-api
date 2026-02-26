import { Router } from 'express';
import { getUserProgress, getSongProgress } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getUserProgress);
router.get('/song/:songId', authenticate, getSongProgress);

export default router;
