import { Router } from 'express';
import { getSongs, getSongById, getSongSentences, getSentenceById, getLevels } from '../controllers/song.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getSongs);
router.get('/levels', authenticate, getLevels);
router.get('/:id', authenticate, getSongById);
router.get('/:id/sentences', authenticate, getSongSentences);
router.get('/:id/sentences/:sentenceId', authenticate, getSentenceById);

export default router;
