import { Injectable, NotFoundException } from '@nestjs/common';
import SongProgress from '../../models/SongProgress';
import PracticeAttempt from '../../models/PracticeAttempt';
import User from '../../models/User';

@Injectable()
export class ProgressService {
  async getUserProgress(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const songProgresses = await SongProgress.find({ userId })
      .populate('songId', 'title artist level thumbnailUrl totalSentences')
      .sort({ updatedAt: -1 });
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyAttempts = await PracticeAttempt.find({ userId, createdAt: { $gte: weekAgo } });
    const weeklyPassed = weeklyAttempts.filter(a => a.passed);
    return {
      profile: {
        level: user.currentLevel, totalXP: user.totalXP, currentStreak: user.currentStreak,
        longestStreak: user.longestStreak, songsCompleted: user.songsCompleted,
        sentencesPracticed: user.sentencesPracticed, averageScore: user.averageScore,
      },
      songProgresses,
      weeklyStats: {
        totalAttempts: weeklyAttempts.length,
        sentencesPassed: weeklyPassed.length,
        averageScore: weeklyPassed.length ? Math.round(weeklyPassed.reduce((s, a) => s + a.scores.overall, 0) / weeklyPassed.length) : 0,
        xpEarned: weeklyAttempts.reduce((s, a) => s + a.xpEarned, 0),
      },
    };
  }

  async getSongProgress(userId: string, songId: string) {
    const progress = await SongProgress.findOne({ userId, songId }).populate('songId');
    if (!progress) return { progress: null, message: 'No progress yet for this song' };
    const bestAttempts = await PracticeAttempt.aggregate([
      { $match: { userId: progress.userId, songId: progress.songId } },
      { $sort: { 'scores.overall': -1 } },
      { $group: { _id: '$sentenceIndex', bestScore: { $first: '$scores.overall' }, attempts: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return { progress, sentenceDetails: bestAttempts };
  }
}
