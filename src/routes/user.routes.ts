import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, changePassword, getStats } from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.get('/stats', authenticate, getStats);

export default router;
