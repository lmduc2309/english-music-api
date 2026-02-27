import { Injectable, NotFoundException } from '@nestjs/common';
import User from '../../models/User';

@Injectable()
export class LeaderboardService {
  async getGlobalLeaderboard(page = 1, limit = 20) {
    const [users, total] = await Promise.all([
      User.find()
        .select('username displayName avatar totalXP currentLevel currentStreak songsCompleted averageScore')
        .sort({ totalXP: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(),
    ]);
    const leaderboard = users.map((u, i) => ({ rank: (page - 1) * limit + i + 1, ...u.toObject() }));
    return { leaderboard, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getLevelLeaderboard(level: string) {
    const users = await User.find({ currentLevel: level })
      .select('username displayName avatar totalXP currentStreak songsCompleted averageScore')
      .sort({ totalXP: -1 })
      .limit(50);
    return { level, leaderboard: users.map((u, i) => ({ rank: i + 1, ...u.toObject() })) };
  }

  async getUserRank(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const [globalRank, levelRank] = await Promise.all([
      User.countDocuments({ totalXP: { $gt: user.totalXP } }),
      User.countDocuments({ currentLevel: user.currentLevel, totalXP: { $gt: user.totalXP } }),
    ]);
    return { globalRank: globalRank + 1, levelRank: levelRank + 1, level: user.currentLevel, totalXP: user.totalXP };
  }
}
