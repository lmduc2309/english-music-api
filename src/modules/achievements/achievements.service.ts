import { Injectable, NotFoundException } from '@nestjs/common';
import { Achievement, UserAchievement } from '../../models/Achievement';
import User from '../../models/User';

@Injectable()
export class AchievementsService {
  async getAllAchievements(userId: string) {
    const [all, userAchievements] = await Promise.all([
      Achievement.find().sort({ rarity: 1, category: 1 }),
      UserAchievement.find({ userId }).select('achievementId earnedAt'),
    ]);
    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId.toString(), ua.earnedAt]));
    return {
      achievements: all.map(a => ({
        ...a.toObject(),
        unlocked: unlockedMap.has(a._id!.toString()),
        earnedAt: unlockedMap.get(a._id!.toString()) || null,
      })),
    };
  }

  async getMyAchievements(userId: string) {
    const userAchievements = await UserAchievement.find({ userId }).populate('achievementId').sort({ earnedAt: -1 });
    return {
      achievements: userAchievements.map(ua => ({ ...(ua.achievementId as any).toObject(), earnedAt: ua.earnedAt })),
      count: userAchievements.length,
    };
  }

  async checkAchievements(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const [all, earned] = await Promise.all([
      Achievement.find(),
      UserAchievement.find({ userId }).select('achievementId'),
    ]);
    const earnedSet = new Set(earned.map(ua => ua.achievementId.toString()));
    const newlyEarned: any[] = [];
    for (const a of all) {
      if (earnedSet.has(a._id!.toString())) continue;
      const { type, value } = a.requirement;
      let qualified = false;
      if (type === 'sentencesPracticed') qualified = user.sentencesPracticed >= value;
      else if (type === 'songsCompleted') qualified = user.songsCompleted >= value;
      else if (type === 'currentStreak') qualified = user.currentStreak >= value;
      else if (type === 'totalXP') qualified = user.totalXP >= value;
      else if (type === 'averageScore') qualified = user.averageScore >= value;
      if (qualified) {
        await UserAchievement.create({ userId, achievementId: a._id });
        await User.findByIdAndUpdate(userId, { $inc: { totalXP: a.xpReward } });
        newlyEarned.push(a);
      }
    }
    return { newlyEarned, count: newlyEarned.length };
  }
}
