import { Router } from 'express';
import { body } from 'express-validator';
import { submitAttempt, getAttemptHistory, getDailyStats } from '../controllers/practice.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/attempt', authenticate, [
  body('songId').notEmpty(),
  body('sentenceId').notEmpty(),
  body('userPitchData').isArray(),
  body('userDuration').isNumeric(),
  body('spokenWords').isArray(),
], validate, submitAttempt);

router.get('/history', authenticate, getAttemptHistory);
router.get('/daily-stats', authenticate, getDailyStats);

export default router;
