import User from '../models/User';
import SongProgress from '../models/SongProgress';
import { Achievement, UserAchievement } from '../models/Achievement';
import { CEFR_LEVELS, CEFRLevel } from '../config/constants';

export class ProgressService {
  /** Update user streak based on daily practice */
  static async updateStreak(userId: string): Promise<{ currentStreak: number; isNewDay: boolean }> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastPractice = user.lastPracticeDate
      ? new Date(user.lastPracticeDate.getFullYear(), user.lastPracticeDate.getMonth(), user.lastPracticeDate.getDate())
      : null;
    let isNewDay = false;
    if (!lastPractice || today.getTime() !== lastPractice.getTime()) {
      isNewDay = true;
      if (lastPractice) {
        const dayDiff = (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24);
        user.currentStreak = dayDiff === 1 ? user.currentStreak + 1 : 1;
      } else {
        user.currentStreak = 1;
      }
      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      user.lastPracticeDate = now;
      await user.save();
    }
    return { currentStreak: user.currentStreak, isNewDay };
  }

  /** Check if user qualifies for level up */
  static async checkLevelUp(userId: string): Promise<CEFRLevel | null> {
    const user = await User.findById(userId);
    if (!user) return null;
    const idx = CEFR_LEVELS.indexOf(user.currentLevel);
    if (idx >= CEFR_LEVELS.length - 1) return null;
    const completed = await SongProgress.countDocuments({ userId, isCompleted: true });
    const thresholds: Record<string, number> = { A1: 3, A2: 5, B1: 7, B2: 10, C1: 12 };
    if (completed >= (thresholds[user.currentLevel] || 5)) {
      const newLevel = CEFR_LEVELS[idx + 1];
      user.currentLevel = newLevel;
      await user.save();
      return newLevel;
    }
    return null;
  }

  /** Check and award new achievements */
  static async checkAchievements(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) return [];
    const newAchievements: string[] = [];
    const all = await Achievement.find();
    const earned = new Set((await UserAchievement.find({ userId }).select('achievementId')).map((e) => e.achievementId.toString()));
    for (const a of all) {
      if (earned.has(a._id.toString())) continue;
      let award = false;
      switch (a.requirement.type) {
        case 'songs_completed': award = user.songsCompleted >= a.requirement.value; break;
        case 'streak_days': award = user.currentStreak >= a.requirement.value; break;
        case 'total_xp': award = user.totalXP >= a.requirement.value; break;
        case 'sentences_practiced': award = user.sentencesPracticed >= a.requirement.value; break;
        case 'current_level': award = CEFR_LEVELS.indexOf(user.currentLevel) >= a.requirement.value; break;
      }
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
