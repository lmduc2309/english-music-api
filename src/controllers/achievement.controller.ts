import { Request, Response } from 'express';
import { Achievement, UserAchievement } from '../models/Achievement';
import User from '../models/User';

/** GET /api/achievements - All achievements with unlock status for current user */
export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const [allAchievements, userAchievements] = await Promise.all([
      Achievement.find().sort({ rarity: 1, category: 1 }),
      UserAchievement.find({ userId: (req as any).userId }).select('achievementId earnedAt'),
    ]);

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId.toString(), ua.earnedAt])
    );

    const achievements = allAchievements.map((a) => ({
      ...a.toObject(),
      unlocked: unlockedMap.has(a._id!.toString()),
      earnedAt: unlockedMap.get(a._id!.toString()) || null,
    }));

    res.json({ achievements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

/** GET /api/achievements/mine - Only user's unlocked achievements */
export const getMyAchievements = async (req: Request, res: Response) => {
  try {
    const userAchievements = await UserAchievement.find({ userId: (req as any).userId })
      .populate('achievementId')
      .sort({ earnedAt: -1 });

    res.json({
      achievements: userAchievements.map((ua) => ({
        ...(ua.achievementId as any).toObject(),
        earnedAt: ua.earnedAt,
      })),
      count: userAchievements.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your achievements' });
  }
};

/** POST /api/achievements/check - Check and award any newly earned achievements */
export const checkAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [allAchievements, alreadyEarned] = await Promise.all([
      Achievement.find(),
      UserAchievement.find({ userId }).select('achievementId'),
    ]);

    const earnedSet = new Set(alreadyEarned.map((ua) => ua.achievementId.toString()));
    const newlyEarned: any[] = [];

    for (const achievement of allAchievements) {
      if (earnedSet.has(achievement._id!.toString())) continue;

      const { type, value } = achievement.requirement;
      let qualified = false;

      if (type === 'sentencesPracticed') qualified = user.sentencesPracticed >= value;
      else if (type === 'songsCompleted') qualified = user.songsCompleted >= value;
      else if (type === 'currentStreak') qualified = user.currentStreak >= value;
      else if (type === 'totalXP') qualified = user.totalXP >= value;
      else if (type === 'averageScore') qualified = user.averageScore >= value;

      if (qualified) {
        await UserAchievement.create({ userId, achievementId: achievement._id });
        // Award XP for the achievement
        await User.findByIdAndUpdate(userId, { $inc: { totalXP: achievement.xpReward } });
        newlyEarned.push(achievement);
      }
    }

    res.json({ newlyEarned, count: newlyEarned.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check achievements' });
  }
};
