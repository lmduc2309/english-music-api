import { Request, Response, NextFunction } from 'express';
import SongProgress from '../models/SongProgress';
import PracticeAttempt from '../models/PracticeAttempt';
import User from '../models/User';

export const getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const songProgresses = await SongProgress.find({ userId })
      .populate('songId', 'title artist level thumbnailUrl totalSentences')
      .sort({ updatedAt: -1 });

    // Weekly stats
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyAttempts = await PracticeAttempt.find({ userId, createdAt: { $gte: weekAgo } });
    const weeklyPassed = weeklyAttempts.filter(a => a.passed);

    res.json({
      profile: {
        level: user.currentLevel,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        songsCompleted: user.songsCompleted,
        sentencesPracticed: user.sentencesPracticed,
        averageScore: user.averageScore,
      },
      songProgresses,
      weeklyStats: {
        totalAttempts: weeklyAttempts.length,
        sentencesPassed: weeklyPassed.length,
        averageScore: weeklyPassed.length ? Math.round(weeklyPassed.reduce((s, a) => s + a.scores.overall, 0) / weeklyPassed.length) : 0,
        xpEarned: weeklyAttempts.reduce((s, a) => s + a.xpEarned, 0),
      },
    });
  } catch (err) { next(err); }
};

export const getSongProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { songId } = req.params;
    const progress = await SongProgress.findOne({ userId, songId }).populate('songId');
    if (!progress) return res.json({ progress: null, message: 'No progress yet for this song' });

    // Get best attempts per sentence
    const bestAttempts = await PracticeAttempt.aggregate([
      { $match: { userId: progress.userId, songId: progress.songId } },
      { $sort: { 'scores.overall': -1 } },
      { $group: { _id: '$sentenceIndex', bestScore: { $first: '$scores.overall' }, attempts: { $sum: 1 }, bestAttempt: { $first: '$$ROOT' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ progress, sentenceDetails: bestAttempts });
  } catch (err) { next(err); }
};
