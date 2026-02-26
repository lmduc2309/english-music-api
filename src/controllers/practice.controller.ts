import { Request, Response, NextFunction } from 'express';
import PracticeAttempt from '../models/PracticeAttempt';
import Sentence from '../models/Sentence';
import User from '../models/User';
import SongProgress from '../models/SongProgress';
import Song from '../models/Song';
import { ScoringService, ScoringInput } from '../services/scoring.service';
import { ProgressService } from '../services/progress.service';
import { PASS_THRESHOLD } from '../config/constants';

export const submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { songId, sentenceId, userPitchData, userDuration, spokenWords } = req.body;

    const sentence = await Sentence.findById(sentenceId);
    if (!sentence) return res.status(404).json({ error: 'Sentence not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Count previous attempts for this sentence
    const prevAttempts = await PracticeAttempt.countDocuments({ userId, sentenceId });

    // Calculate scores
    const input: ScoringInput = {
      userPitchData,
      referencePitchData: sentence.pitchData || [],
      userDuration,
      referenceDuration: sentence.duration,
      spokenWords,
      expectedWords: sentence.words.map(w => w.text),
    };
    const result = ScoringService.calculateScore(input, user.currentStreak);

    // Save attempt
    const attempt = await PracticeAttempt.create({
      userId, songId, sentenceId,
      sentenceIndex: sentence.index,
      scores: result.scores,
      passed: result.passed,
      attemptNumber: prevAttempts + 1,
      wordScores: result.wordScores,
      xpEarned: result.xpEarned,
      feedback: result.feedback,
    });

    // Update user stats
    if (result.passed) {
      await ProgressService.updateUserProgress(userId, result.xpEarned, result.scores.overall);
      await ProgressService.updateSongProgress(userId, songId, sentence.index);
    }

    // Check if song is completed
    const song = await Song.findById(songId);
    const progress = await SongProgress.findOne({ userId, songId });
    const isComplete = progress && song && progress.completedSentences.length >= song.totalSentences;

    if (isComplete && song) {
      user.songsCompleted += 1;
      await user.save();
      song.completionCount += 1;
      await song.save();
    }

    // Find words that need practice (scored below 80)
    const needsPractice = result.wordScores.filter(w => !w.correct).map(w => w.word);

    res.json({
      attempt: { id: attempt._id, scores: result.scores, passed: result.passed, attemptNumber: attempt.attemptNumber },
      feedback: result.feedback,
      xpEarned: result.xpEarned,
      wordScores: result.wordScores,
      needsPractice,
      canContinue: result.passed,
      nextSentenceIndex: result.passed ? sentence.index + 1 : sentence.index,
      isSongComplete: isComplete || false,
    });
  } catch (err) { next(err); }
};

export const getAttemptHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { songId, sentenceId, page = '1', limit = '20' } = req.query;
    const filter: any = { userId };
    if (songId) filter.songId = songId;
    if (sentenceId) filter.sentenceId = sentenceId;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const [attempts, total] = await Promise.all([
      PracticeAttempt.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).populate('sentenceId', 'text index'),
      PracticeAttempt.countDocuments(filter),
    ]);
    res.json({ attempts, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
};

export const getDailyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const todayAttempts = await PracticeAttempt.find({ userId, createdAt: { $gte: startOfDay } });
    const passed = todayAttempts.filter(a => a.passed);
    const avgScore = passed.length ? Math.round(passed.reduce((s, a) => s + a.scores.overall, 0) / passed.length) : 0;
    const xpToday = todayAttempts.reduce((s, a) => s + a.xpEarned, 0);
    res.json({
      totalAttempts: todayAttempts.length,
      sentencesPassed: passed.length,
      averageScore: avgScore,
      xpEarned: xpToday,
      minutesPracticed: Math.round(todayAttempts.length * 0.5),
    });
  } catch (err) { next(err); }
};
