import { Injectable } from '@nestjs/common';
import User from '../models/User';
import SongProgress from '../models/SongProgress';
import { Achievement, UserAchievement } from '../models/Achievement';
import { CEFR_LEVELS, CEFRLevel } from '../common/constants';

@Injectable()
export class ProgressHelperService {
  async updateUserProgress(userId: string, xpEarned: number, score: number): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;
    user.totalXP += xpEarned;
    user.sentencesPracticed += 1;
    // Rolling average
    user.averageScore = user.sentencesPracticed === 1
      ? score
      : Math.round((user.averageScore * (user.sentencesPracticed - 1) + score) / user.sentencesPracticed);
    await user.save();
  }

  async updateSongProgress(userId: string, songId: string, sentenceIndex: number): Promise<void> {
    const progress = await SongProgress.findOneAndUpdate(
      { userId, songId },
      { $addToSet: { completedSentences: sentenceIndex }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true },
    );
    if (!progress.isCompleted) {
      const Song = require('../models/Song').default;
      const song = await Song.findById(songId);
      if (song && progress.completedSentences.length >= song.totalSentences) {
        await SongProgress.findByIdAndUpdate(progress._id, { isCompleted: true, completedAt: new Date() });
      }
    }
  }

  async updateStreak(userId: string): Promise<{ currentStreak: number; isNewDay: boolean }> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const lastPractice = user.lastPracticeDate
      ? new Date(user.lastPracticeDate.getFullYear(), user.lastPracticeDate.getMonth(), user.lastPracticeDate.getDate())
      : null;
    let isNewDay = false;
    if (!lastPractice || today.getTime() !== lastPractice.getTime()) {
      isNewDay = true;
      if (lastPractice) {
        const dayDiff = (today.getTime() - lastPractice.getTime()) / 86400000;
        user.currentStreak = dayDiff === 1 ? user.currentStreak + 1 : 1;
      } else {
        user.currentStreak = 1;
      }
      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      user.lastPracticeDate = new Date();
      await user.save();
    }
    return { currentStreak: user.currentStreak, isNewDay };
  }

  async checkLevelUp(userId: string): Promise<CEFRLevel | null> {
    const user = await User.findById(userId);
    if (!user) return null;
    const idx = CEFR_LEVELS.indexOf(user.currentLevel);
    if (idx >= CEFR_LEVELS.length - 1) return null;
    const completed = await SongProgress.countDocuments({ userId, isCompleted: true });
    const thresholds: Record<string, number> = { A1: 3, A2: 5, B1: 7, B2: 10, C1: 12 };
    if (completed >= (thresholds[user.currentLevel] || 5)) {
      const newLevel = CEFR_LEVELS[idx + 1];
      await User.findByIdAndUpdate(userId, { currentLevel: newLevel });
      return newLevel;
    }
    return null;
  }

  async checkAchievements(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) return [];
    const newAchievements: string[] = [];
    const all = await Achievement.find();
    const earned = new Set((await UserAchievement.find({ userId }).select('achievementId')).map(e => e.achievementId.toString()));
    for (const a of all) {
      if (earned.has(a._id.toString())) continue;
      let award = false;
      const { type, value } = a.requirement;
      if (type === 'songs_completed') award = user.songsCompleted >= value;
      else if (type === 'streak_days') award = user.currentStreak >= value;
      else if (type === 'total_xp') award = user.totalXP >= value;
      else if (type === 'sentences_practiced') award = user.sentencesPracticed >= value;
      else if (type === 'current_level') award = CEFR_LEVELS.indexOf(user.currentLevel) >= value;
      if (award) {
        await UserAchievement.create({ userId, achievementId: a._id });
        user.totalXP += a.xpReward;
        newAchievements.push(a.name);
      }
    }
    if (newAchievements.length) await user.save();
    return newAchievements;
  }
}
